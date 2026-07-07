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

// Mirrors src/shared/dateUtils.js diasHasta() - dia_corte/dia_pago are day-of-month integers.
function diasHasta(diaObjetivo: number | null): number | null {
  if (!diaObjetivo) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let candidato = new Date(hoy.getFullYear(), hoy.getMonth(), diaObjetivo);
  candidato.setHours(0, 0, 0, 0);
  if (candidato < hoy) {
    candidato = new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaObjetivo);
  }
  return Math.round((candidato.getTime() - hoy.getTime()) / 86400000);
}

function claveMes(fechaIso: string): string {
  const d = new Date(fechaIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nombreMes(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
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
  try {
    const body = await req.json();
    pregunta = typeof body?.pregunta === "string" ? body.pregunta.trim() : "";
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
  ] = await Promise.all([
    supabase.from("cuentas").select("nombre, saldo"),
    supabase.from("tarjetas").select("nombre, banco, linea_total, saldo_usado, dia_corte, dia_pago"),
    supabase
      .from("movimientos")
      .select("monto, fecha, tipo_accion, categoria:categorias(nombre)")
      .in("tipo_accion", ["gasto_credito", "gasto_debito"])
      .gte("fecha", hace6Meses.toISOString()),
    supabase.from("suscripciones_estado").select("nombre, monto, frecuencia, costo_mensual_equivalente, target_nombre"),
  ]);

  if (errCuentas || errTarjetas || errMovimientos || errSuscripciones) {
    console.error("Error leyendo datos:", errCuentas || errTarjetas || errMovimientos || errSuscripciones);
    return jsonResponse({ error: "No se pudieron leer tus datos" }, 500);
  }

  const resumenCuentas =
    (cuentas || []).map((c) => `- ${c.nombre}: saldo $${Number(c.saldo).toFixed(2)}`).join("\n") ||
    "Sin cuentas de ahorro registradas.";

  const resumenTarjetas =
    (tarjetas || [])
      .map((t) => {
        const disponible = Number(t.linea_total) - Number(t.saldo_usado);
        const diasCorte = diasHasta(t.dia_corte);
        const diasPago = diasHasta(t.dia_pago);
        return `- ${t.nombre} (${t.banco}): disponible $${disponible.toFixed(2)}, ${
          diasCorte !== null ? `corte en ${diasCorte} días` : "sin día de corte configurado"
        }, ${diasPago !== null ? `pago en ${diasPago} días` : "sin día de pago configurado"}`;
      })
      .join("\n") || "Sin tarjetas de crédito registradas.";

  // --- Gasto por categoría, agregado por mes (código hace la suma, no el modelo) ---
  const claveMesActual = claveMes(new Date().toISOString());
  const mesAnteriorDate = new Date();
  mesAnteriorDate.setMonth(mesAnteriorDate.getMonth() - 1);
  const claveMesAnterior = claveMes(mesAnteriorDate.toISOString());

  const porCategoriaYMes: Record<string, Record<string, number>> = {};
  const totalPorMes: Record<string, number> = {};

  (movimientos || []).forEach((m: any) => {
    const cat = m.categoria?.nombre || "Sin categoría";
    const mes = claveMes(m.fecha);
    const monto = Number(m.monto);
    porCategoriaYMes[cat] = porCategoriaYMes[cat] || {};
    porCategoriaYMes[cat][mes] = (porCategoriaYMes[cat][mes] || 0) + monto;
    totalPorMes[mes] = (totalPorMes[mes] || 0) + monto;
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

  const resumenSuscripciones =
    (suscripciones || [])
      .map(
        (s: any) =>
          `- ${s.nombre}: $${Number(s.monto).toFixed(2)} (${s.frecuencia}, equivalente mensual $${Number(
            s.costo_mensual_equivalente
          ).toFixed(2)}) cargado a ${s.target_nombre}`
      )
      .join("\n") || "Sin suscripciones activas.";

  const systemPrompt =
    "Eres un asesor financiero dentro de una app personal de finanzas. Solo puedes usar los datos que se te dan " +
    "explícitamente abajo (cuentas, tarjetas, gasto por categoría de los últimos 6 meses, y suscripciones) -- " +
    "nunca inventes montos, tasas, fechas o disponibles que no aparezcan en esos datos, y nunca asumas datos de " +
    "meses fuera del rango que se te dio. Puedes comparar meses, identificar en qué categoría gastó más el usuario, " +
    "señalar tendencias, y ayudarlo a tomar mejores decisiones financieras con base en esos datos. Si falta " +
    "información para responder con certeza, dilo claramente en vez de suponer. Responde siempre en español, de " +
    "forma directa y sin rodeos -- usa 3 a 5 líneas para preguntas simples, y hasta 8-10 líneas (con desglose breve) " +
    "cuando la pregunta pida comparar categorías o meses.";

  const hoyTexto = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userMessage =
    `Fecha de hoy: ${hoyTexto}\n\n` +
    `Cuentas de ahorro:\n${resumenCuentas}\n\n` +
    `Tarjetas de crédito:\n${resumenTarjetas}\n\n` +
    `Suscripciones activas:\n${resumenSuscripciones}\n\n` +
    `Gasto total este mes (${nombreMes(claveMesActual)}): $${totalMesActual.toFixed(2)}\n` +
    `Gasto total mes anterior (${nombreMes(claveMesAnterior)}): $${totalMesAnterior.toFixed(2)}\n\n` +
    `Gasto por categoría, últimos 6 meses (formato: categoría -> mes: monto, mes: monto...):\n${resumenCategoriaHistorico}\n\n` +
    `Pregunta del usuario: ${pregunta}`;

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
        messages: [{ role: "user", content: userMessage }],
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
