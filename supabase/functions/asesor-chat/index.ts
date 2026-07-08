import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Si el mes no tiene ese día (ej. día 30 en febrero), usa el último día del mes en vez
// de desbordar al mes siguiente (comportamiento por defecto de `new Date(y, m, d)`).
function diaClamp(anio: number, mes: number, dia: number): Date {
  const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
  const d = new Date(anio, mes, Math.min(dia, ultimoDiaDelMes));
  d.setHours(0, 0, 0, 0);
  return d;
}

// Mirrors src/shared/dateUtils.js diasHasta() - dia_corte/dia_pago are day-of-month integers.
function fechaObjetivo(diaObjetivo: number | null): Date | null {
  if (!diaObjetivo) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = diaClamp(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  if (candidato < hoy) {
    candidato = diaClamp(hoy.getFullYear(), hoy.getMonth() + 1, diaObjetivo);
  }
  return candidato;
}

// La fecha de corte MÁS RECIENTE (hoy o en el pasado) -- es el corte que generó
// la deuda que hay que pagar ahora, a diferencia de fechaObjetivo() que da el
// PRÓXIMO corte futuro (el que todavía se está acumulando).
function fechaUltimoCorte(diaCorte: number | null): Date | null {
  if (!diaCorte) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = diaClamp(hoy.getFullYear(), hoy.getMonth(), diaCorte);
  if (candidato > hoy) {
    candidato = diaClamp(hoy.getFullYear(), hoy.getMonth() - 1, diaCorte);
  }
  return candidato;
}

// La fecha de pago que corresponde a un corte específico -- siempre es la primera
// ocurrencia del día de pago DESPUÉS de ese corte (puede caer en el mismo mes o en
// el siguiente, dependiendo de si el día de pago es mayor o menor que el día de corte).
function fechaPagoDeCorte(fechaCorte: Date, diaPago: number | null): Date | null {
  if (!diaPago) return null;
  let candidato = diaClamp(fechaCorte.getFullYear(), fechaCorte.getMonth(), diaPago);
  if (candidato <= fechaCorte) {
    candidato = diaClamp(fechaCorte.getFullYear(), fechaCorte.getMonth() + 1, diaPago);
  }
  return candidato;
}

function diasEntreHoyY(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
}

function fmtFechaLarga(d: Date): string {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function claveMes(fechaIso: string): string {
  const d = new Date(fechaIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nombreMes(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

// PostgREST returns `categoria` as a single embedded object here (movimientos.categoria_id
// is a to-one FK into categorias) — cast via `unknown` since this untyped client can't infer it.
interface MovimientoRow {
  monto: number;
  fecha: string;
  tipo_accion: string;
  target_tipo: string;
  target_id: string;
  nota: string | null;
  categoria: { nombre: string } | null;
}

interface SuscripcionRow {
  nombre: string;
  monto: number;
  frecuencia: string;
  costo_mensual_equivalente: number;
  target_nombre: string;
  pendiente_confirmar: boolean;
}

interface MsiRow {
  tarjeta_id: string;
  descripcion: string;
  mensualidad: number;
  meses_restantes: number;
  saldo_pendiente: number;
}

function esTurnoHistorial(m: unknown): m is { rol: string; contenido: string } {
  const t = m as { rol?: unknown; contenido?: unknown };
  return (t?.rol === "usuario" || t?.rol === "asesor") && typeof t?.contenido === "string";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "No autorizado" }, 401);
  }

  let pregunta = "";
  let historial: Array<{ rol: string; contenido: string }> = [];
  try {
    const body = await req.json();
    pregunta = typeof body?.pregunta === "string" ? body.pregunta.trim() : "";
    if (Array.isArray(body?.historial)) {
      historial = body.historial.filter(esTurnoHistorial).slice(-10);
    }
  } catch {
    return jsonResponse({ error: "Cuerpo de la solicitud inválido" }, 400);
  }
  if (!pregunta) {
    return jsonResponse({ error: "Falta la pregunta" }, 400);
  }

  // Client scoped to the caller's own JWT, so existing RLS policies decide what it can read.
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authHeader } },
  });

  const hace6Meses = new Date();
  hace6Meses.setDate(hace6Meses.getDate() - 180);

  const [
    { data: cuentas, error: errCuentas },
    { data: tarjetas, error: errTarjetas },
    { data: movimientos, error: errMovimientos },
    { data: suscripciones, error: errSuscripciones },
    { data: comprasMsi, error: errMsi },
  ] = await Promise.all([
    supabase.from("cuentas").select("nombre, saldo"),
    supabase.from("tarjetas").select("id, nombre, banco, linea_total, saldo_usado, dia_corte, dia_pago"),
    // Sin filtrar tipo_accion: se necesitan también pago_tarjeta e ingreso_cuenta para el resumen mensual.
    supabase
      .from("movimientos")
      .select("monto, fecha, tipo_accion, target_tipo, target_id, nota, categoria:categorias(nombre)")
      .gte("fecha", hace6Meses.toISOString()),
    supabase
      .from("suscripciones_estado")
      .select("nombre, monto, frecuencia, costo_mensual_equivalente, target_nombre, pendiente_confirmar"),
    supabase.from("msi_detalle").select("tarjeta_id, descripcion, mensualidad, meses_restantes, saldo_pendiente"),
  ]);

  if (errCuentas || errTarjetas || errMovimientos || errSuscripciones || errMsi) {
    console.error("Error leyendo datos:", errCuentas || errTarjetas || errMovimientos || errSuscripciones || errMsi);
    return jsonResponse({ error: "No se pudieron leer tus datos" }, 500);
  }

  const hoyTexto = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const resumenCuentas =
    (cuentas || []).map((c) => `- ${c.nombre}: saldo $${Number(c.saldo).toFixed(2)}`).join("\n") ||
    "Sin cuentas de ahorro registradas.";

  const movimientosList = (movimientos as unknown as MovimientoRow[]) || [];
  const comprasMsiList = (comprasMsi as unknown as MsiRow[]) || [];

  // Mensualidad total de compras a meses activas, por tarjeta -- esto es lo que
  // realmente toca pagar de esas compras este corte, no su saldo pendiente completo.
  const mensualidadMsiPorTarjeta: Record<string, number> = {};
  comprasMsiList
    .filter((c) => c.meses_restantes > 0 && Number(c.saldo_pendiente) > 0)
    .forEach((c) => {
      mensualidadMsiPorTarjeta[c.tarjeta_id] = (mensualidadMsiPorTarjeta[c.tarjeta_id] || 0) + Number(c.mensualidad);
    });

  // Suma el gasto_credito "normal" (excluyendo el cargo original de compras a meses,
  // que siempre trae "meses sin intereses" en la nota) de una tarjeta, en una ventana de fechas.
  function gastoNormalEnVentana(tarjetaId: string, desde: Date, hasta: Date): number {
    return movimientosList
      .filter(
        (m) =>
          m.tipo_accion === "gasto_credito" &&
          m.target_tipo === "tarjeta" &&
          m.target_id === tarjetaId &&
          !/meses sin intereses/i.test(m.nota || "") &&
          new Date(m.fecha) > desde &&
          new Date(m.fecha) <= hasta
      )
      .reduce((s, m) => s + Number(m.monto), 0);
  }

  const resumenTarjetas =
    (tarjetas || [])
      .map((t) => {
        const lineaTotal = Number(t.linea_total);
        const saldoUsado = Number(t.saldo_usado);
        const disponible = lineaTotal - saldoUsado;

        // El corte más reciente ya cerró el ciclo que generó la deuda que hay que pagar ahora.
        // El próximo corte todavía está acumulando gasto del ciclo actual (abierto).
        const ultimoCorte = fechaUltimoCorte(t.dia_corte);
        const proximoCorte = fechaObjetivo(t.dia_corte);
        // El pago que toca hacer ahora es el que corresponde al corte YA CERRADO, no al próximo.
        const proximoPago = ultimoCorte ? fechaPagoDeCorte(ultimoCorte, t.dia_pago) : null;

        const diasProximoCorte = proximoCorte ? diasEntreHoyY(proximoCorte) : null;
        const diasProximoPago = proximoPago ? diasEntreHoyY(proximoPago) : null;

        const mensualidadesMsi = mensualidadMsiPorTarjeta[t.id] || 0;

        let textoAPagar = "no se puede calcular (falta configurar el día de corte)";
        if (ultimoCorte) {
          const inicioCicloCerrado = new Date(ultimoCorte);
          inicioCicloCerrado.setMonth(inicioCicloCerrado.getMonth() - 1);
          const gastoCicloCerrado = gastoNormalEnVentana(t.id, inicioCicloCerrado, ultimoCorte);
          const totalAPagar = gastoCicloCerrado + mensualidadesMsi;
          textoAPagar =
            `$${totalAPagar.toFixed(2)} (gasto normal del ciclo que cerró en tu corte del ${fmtFechaLarga(ultimoCorte)}: ` +
            `$${gastoCicloCerrado.toFixed(2)} + mensualidades de compras a meses: $${mensualidadesMsi.toFixed(2)})`;
        }

        let textoAcumuladoCicloActual = "no se puede calcular (falta configurar el día de corte)";
        if (ultimoCorte && proximoCorte) {
          const gastoCicloActual = gastoNormalEnVentana(t.id, ultimoCorte, proximoCorte);
          textoAcumuladoCicloActual = `$${(gastoCicloActual + mensualidadesMsi).toFixed(2)} (esto es real y ya se gastó; se facturará en el próximo corte, y puede seguir subiendo si el usuario sigue gastando antes de esa fecha)`;
        }

        return (
          `- ${t.nombre} (${t.banco}):\n` +
          `    Día de corte configurado: ${t.dia_corte ?? "sin configurar"} de cada mes. Día de pago configurado: ${t.dia_pago ?? "sin configurar"} de cada mes.\n` +
          `    Orden del ciclo: primero corta (cierra lo gastado), después se paga -- el pago siempre es posterior al corte al que pertenece, aunque su día de mes sea numéricamente menor (ej. corte día 25, pago día 15 del MES SIGUIENTE).\n` +
          `    línea total $${lineaTotal.toFixed(2)}, usado (ocupa el límite, incluye el MONTO TOTAL de compras a meses activas, NO es lo que se paga) $${saldoUsado.toFixed(2)}, disponible $${disponible.toFixed(2)}.\n` +
          `    PRÓXIMA FECHA DE PAGO (la real, ya calculada, correcta, para HOY que es ${hoyTexto}): ${proximoPago ? `${fmtFechaLarga(proximoPago)} (en ${diasProximoPago} días)` : "sin día de pago configurado"}. Monto a pagar en ese pago: ${proximoPago ? textoAPagar : "N/A"}.\n` +
          `    PRÓXIMO CORTE (la fecha real, ya calculada, correcta, para HOY que es ${hoyTexto}): ${proximoCorte ? `${fmtFechaLarga(proximoCorte)} (en ${diasProximoCorte} días)` : "sin día de corte configurado"}. Acumulado hasta hoy en ese ciclo (aún no se paga, es informativo): ${proximoCorte ? textoAcumuladoCicloActual : "N/A"}.`
        );
      })
      .join("\n") || "Sin tarjetas de crédito registradas.";

  // --- Gasto por categoría, agregado por mes (código hace la suma, no el modelo) ---
  const claveMesActual = claveMes(new Date().toISOString());
  const mesAnteriorDate = new Date();
  mesAnteriorDate.setMonth(mesAnteriorDate.getMonth() - 1);
  const claveMesAnterior = claveMes(mesAnteriorDate.toISOString());

  const porCategoriaYMes: Record<string, Record<string, number>> = {};
  const totalPorMes: Record<string, number> = {};
  const pagosTarjetaPorMes: Record<string, number> = {};
  const ingresosPorMes: Record<string, number> = {};

  movimientosList.forEach((m) => {
    const mes = claveMes(m.fecha);
    const monto = Number(m.monto);

    if (m.tipo_accion === "gasto_credito" || m.tipo_accion === "gasto_debito") {
      const cat = m.categoria?.nombre || "Sin categoría";
      porCategoriaYMes[cat] = porCategoriaYMes[cat] || {};
      porCategoriaYMes[cat][mes] = (porCategoriaYMes[cat][mes] || 0) + monto;
      totalPorMes[mes] = (totalPorMes[mes] || 0) + monto;
    } else if (m.tipo_accion === "pago_tarjeta") {
      pagosTarjetaPorMes[mes] = (pagosTarjetaPorMes[mes] || 0) + monto;
    } else if (m.tipo_accion === "ingreso_cuenta") {
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + monto;
    }
  });

  const resumenCategoriaHistorico =
    Object.entries(porCategoriaYMes)
      .map(([cat, porMes]) => {
        const linea = Object.entries(porMes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([mes, total]) => `${nombreMes(mes)}: $${total.toFixed(2)}`)
          .join(", ");
        return `- ${cat} -> ${linea}`;
      })
      .join("\n") || "Sin gastos categorizados en los últimos 6 meses.";

  const totalMesActual = totalPorMes[claveMesActual] || 0;
  const totalMesAnterior = totalPorMes[claveMesAnterior] || 0;
  const pagosTarjetaMesActual = pagosTarjetaPorMes[claveMesActual] || 0;
  const pagosTarjetaMesAnterior = pagosTarjetaPorMes[claveMesAnterior] || 0;
  const ingresosMesActual = ingresosPorMes[claveMesActual] || 0;
  const ingresosMesAnterior = ingresosPorMes[claveMesAnterior] || 0;

  const resumenSuscripciones =
    ((suscripciones as unknown as SuscripcionRow[]) || [])
      .map(
        (s) =>
          `- ${s.nombre}: $${Number(s.monto).toFixed(2)} (${s.frecuencia}, equivalente mensual $${Number(
            s.costo_mensual_equivalente
          ).toFixed(2)}) cargado a ${s.target_nombre}${s.pendiente_confirmar ? " -- PENDIENTE DE CONFIRMAR ESTE CICLO" : ""}`
      )
      .join("\n") || "Sin suscripciones activas.";

  const tarjetaNombrePorId: Record<string, string> = {};
  (tarjetas || []).forEach((t) => { tarjetaNombrePorId[t.id] = t.nombre; });

  const resumenMsi =
    comprasMsiList
      .filter((c) => c.meses_restantes > 0 && Number(c.saldo_pendiente) > 0)
      .map(
        (c) =>
          `- ${c.descripcion || "Compra a meses"} (${tarjetaNombrePorId[c.tarjeta_id] || "tarjeta"}): mensualidad $${Number(
            c.mensualidad
          ).toFixed(2)}, saldo pendiente $${Number(c.saldo_pendiente).toFixed(2)}, ${c.meses_restantes} meses restantes`
      )
      .join("\n") || "Sin compras a meses sin intereses activas.";

  const systemPrompt =
    "Eres FinnIA un asesor financiero dentro de una app personal de finanzas. " +
    "IMPORTANTE sobre saludos: si la pregunta del usuario es un saludo genérico (ej. 'hola', 'buenas', 'qué tal', " +
    "o un mensaje sin una pregunta financiera específica), responde MUY breve -- un saludo corto, y una pregunta " +
    "de vuelta invitándolo a decir en qué quiere profundizar, mencionando 2-3 ejemplos de temas (ej. deuda total, " +
    "estado de una tarjeta, gasto por categoría). NO reveles cifras, saldos, fechas de corte/pago, ni ningún " +
    "análisis en ese primer saludo, aunque los tengas disponibles -- eso solo se comparte cuando lo pidan " +
    "explícitamente en su pregunta. " +
    "Solo puedes usar los datos que se te dan " +
    "explícitamente abajo (cuentas, tarjetas, gasto por categoría de los últimos 6 meses, pagos a tarjeta e " +
    "ingresos por mes, compras a meses sin intereses activas, y suscripciones) -- nunca inventes montos, tasas, " +
    "fechas o disponibles que no aparezcan en esos datos, y nunca asumas datos de meses fuera del rango que se te " +
    "dio. Puedes comparar meses, identificar en qué categoría gastó más el usuario, señalar tendencias, avisar de " +
    "suscripciones pendientes de confirmar, considerar las mensualidades de compras a meses como compromiso fijo " +
    "junto con las suscripciones, y ayudarlo a tomar mejores decisiones financieras con base en esos datos. " +
    "IMPORTANTE sobre tarjetas: el 'usado' de una tarjeta ocupa su límite e incluye el monto TOTAL de las compras " +
    "a meses activas, aunque el usuario no deba pagar eso completo -- nunca uses 'usado' como el monto a pagar. " +
    "Cada tarjeta te da dos cifras y debes usar la correcta según lo que pregunten: (1) 'Próximo pago' con su " +
    "'monto a pagar' -- es deuda YA VENCIDA del corte que ya cerró y todavía no se ha pagado; menciónala como algo " +
    "urgente SOLO cuando sea mayor a $0 (si es $0, no hay nada vencido, no le des importancia a ese cero, no lo " +
    "repitas ni lo destaques). (2) 'acumulado hasta hoy' del ciclo actual -- es el saldo REAL que el usuario ya " +
    "gastó desde su último corte, un hecho concreto y actual, NO lo trates como estimado, dudoso, 'informativo' " +
    "o 'probable'; puede seguir subiendo si sigue gastando antes del próximo corte, pero lo que ya lleva es un " +
    "número firme. Si el usuario pregunta 'cuánto debo' o 'cuál es mi saldo' de una tarjeta sin más contexto, " +
    "responde con el 'acumulado hasta hoy' como la cifra principal (así sea $0 el 'Próximo pago'), menciona la " +
    "fecha del próximo corte, y agrega el 'Próximo pago' solo si es mayor a $0 (avisando que eso es aparte, ya " +
    "vencido). Para calcular cuánto le quedaría en una cuenta de ahorro si paga una tarjeta, usa 'acumulado hasta " +
    "hoy' + 'Próximo pago' (si es mayor a $0) como el total a pagar. Si un campo dice que no se pudo calcular, " +
    "dilo así en vez de usar 'usado' como sustituto. " +
    "IMPORTANTE sobre fechas: las fechas de corte y pago, y el número de días que faltan para cada una, ya vienen " +
    "calculadas y son exactas, y ya están correctamente relacionadas entre sí (el pago mostrado es el que " +
    "corresponde a ese corte, aunque su fecha de pago caiga antes en el calendario que la fecha de corte -- eso " +
    "es normal y no es un error en los datos) -- nunca las recalcules, las sumes, ni infieras una fecha distinta " +
    "por tu cuenta, ni marques como inconsistencia que un pago caiga antes que un corte. Cópialas literalmente " +
    "tal como se te dan. Si necesitas mencionar cuántos días de margen hay entre el corte y el pago, usa " +
    "exactamente los días que se te dieron para cada uno (no vuelvas a contarlos a partir de la fecha). " +
    "IMPORTANTE sobre memoria de la conversación: los mensajes anteriores de este chat pueden contener fechas o " +
    "montos que TÚ MISMO dijiste antes, pero que ya no son válidos -- el tiempo pasa entre un mensaje y otro, y " +
    "los datos financieros se recalculan de cero en cada pregunta. NUNCA repitas, copies o te bases en una fecha " +
    "o monto que mencionaste en un turno anterior; siempre usa exclusivamente los datos que se te dan en ESTE " +
    "turno (los de más abajo, junto a la pregunta actual), incluso si contradicen algo que dijiste antes -- en " +
    "ese caso los datos nuevos siempre tienen prioridad, y los anteriores estaban desactualizados. " +
    "Si falta información para responder con certeza, dilo claramente en vez de suponer. Responde siempre en " +
    "español, de forma directa y sin rodeos -- usa 3 a 5 líneas para preguntas simples, y hasta 8-10 líneas (con " +
    "desglose breve) cuando la pregunta pida comparar categorías o meses.";

  const userMessage =
    `Fecha de hoy: ${hoyTexto}\n\n` +
    `Cuentas de ahorro:\n${resumenCuentas}\n\n` +
    `Tarjetas de crédito:\n${resumenTarjetas}\n\n` +
    `Compras a meses sin intereses activas:\n${resumenMsi}\n\n` +
    `Suscripciones activas:\n${resumenSuscripciones}\n\n` +
    `Gasto total este mes (${nombreMes(claveMesActual)}): $${totalMesActual.toFixed(2)}\n` +
    `Gasto total mes anterior (${nombreMes(claveMesAnterior)}): $${totalMesAnterior.toFixed(2)}\n\n` +
    `Pagos a tarjeta este mes: $${pagosTarjetaMesActual.toFixed(2)}\n` +
    `Pagos a tarjeta mes anterior: $${pagosTarjetaMesAnterior.toFixed(2)}\n\n` +
    `Ingresos a cuentas este mes: $${ingresosMesActual.toFixed(2)}\n` +
    `Ingresos a cuentas mes anterior: $${ingresosMesAnterior.toFixed(2)}\n\n` +
    `Gasto por categoría, últimos 6 meses (formato: categoría -> mes: monto, mes: monto...):\n${resumenCategoriaHistorico}\n\n` +
    `Pregunta del usuario: ${pregunta}`;

  // Turnos previos de esta conversación, para que el modelo tenga memoria de lo ya hablado.
  // Los datos financieros siempre van frescos en el último turno (arriba), nunca se asume que
  // los números mencionados en turnos anteriores siguen vigentes.
  const turnosPrevios = historial.map((m) => ({
    role: m.rol === "usuario" ? "user" : "assistant",
    content: m.contenido,
  }));

  const messages = [...turnosPrevios, { role: "user", content: userMessage }];

  // DEBUG temporal: para diagnosticar inconsistencias de fecha/monto, revisa
  // `supabase functions logs asesor-chat` y compara contra lo que responde el modelo.
  console.log("[asesor-chat] resumenTarjetas:", resumenTarjetas);
  console.log("[asesor-chat] turnos previos incluidos:", turnosPrevios.length);
  console.log("[asesor-chat] pregunta:", pregunta);

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    });
  } catch (e) {
    console.error("Error llamando a Anthropic:", e);
    return jsonResponse({ error: "El asesor no está disponible en este momento" }, 502);
  }

  if (!anthropicRes.ok) {
    console.error("Anthropic API error:", await anthropicRes.text());
    return jsonResponse({ error: "El asesor no está disponible en este momento" }, 502);
  }

  const data = await anthropicRes.json();
  const respuesta = data.content?.[0]?.text?.trim() || "No pude generar una respuesta.";

  return jsonResponse({ respuesta });
});
