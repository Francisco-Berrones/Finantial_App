import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.USER_ID;
const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY;
const AI_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_DESTINO = process.env.EMAIL_DESTINO;
const EMAIL_ORIGEN = process.env.EMAIL_ORIGEN || "onboarding@resend.dev";

export default async function handler(req, res) {
  // Vercel manda este header automáticamente al disparar el cron,
  // usando el valor que le des a la variable CRON_SECRET. Así
  // confirmamos que quien llama es Vercel y no cualquiera que
  // adivine la URL.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  // service_role a propósito: no hay sesión de usuario en un cron.
  // El acceso ya quedó cerrado arriba con CRON_SECRET, y por eso
  // filtramos todo a mano por USER_ID (auth.uid() no existe aquí).
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ?mes=YYYY-MM permite forzar el mes a analizar (solo para pruebas manuales);
  // sin el parámetro, se usa el mes que acaba de cerrar, como hace el cron real.
  const mesForzado = req.query?.mes;
  let inicioMesActual, finMesActual, inicioMesAnterior;
  if (mesForzado && /^\d{4}-\d{2}$/.test(mesForzado)) {
    const [anio, mes] = mesForzado.split("-").map(Number);
    inicioMesActual = new Date(anio, mes - 1, 1);
    finMesActual = new Date(anio, mes, 1);
    inicioMesAnterior = new Date(anio, mes - 2, 1);
  } else {
    const hoy = new Date();
    inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1); // el mes que acaba de cerrar
    finMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
  }

  const { data: movActual } = await supabase
    .from("movimientos")
    .select("monto, tipo_accion, categoria_id, fecha")
    .eq("user_id", USER_ID)
    .in("tipo_accion", ["gasto_credito", "gasto_debito"])
    .gte("fecha", inicioMesActual.toISOString())
    .lt("fecha", finMesActual.toISOString());

  const { data: movAnterior } = await supabase
    .from("movimientos")
    .select("monto")
    .eq("user_id", USER_ID)
    .in("tipo_accion", ["gasto_credito", "gasto_debito"])
    .gte("fecha", inicioMesAnterior.toISOString())
    .lt("fecha", inicioMesActual.toISOString());

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("user_id", USER_ID);

  // --- Todo lo numérico se calcula aquí, en código normal ---
  const totalActual = (movActual || []).reduce((s, m) => s + Number(m.monto), 0);
  const totalAnterior = (movAnterior || []).reduce((s, m) => s + Number(m.monto), 0);
  const cambioPct = totalAnterior > 0 ? ((totalActual - totalAnterior) / totalAnterior) * 100 : null;

  const porCategoria = {};
  for (const m of movActual || []) {
    const nombre = categorias?.find((c) => c.id === m.categoria_id)?.nombre || "Sin categoría";
    porCategoria[nombre] = (porCategoria[nombre] || 0) + Number(m.monto);
  }
  const categoriasOrdenadas = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, total]) => ({ nombre, total: Math.round(total * 100) / 100 }));

  const nombreMes = inicioMesActual.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const contexto = `Mes analizado: ${nombreMes}
Total gastado: ${totalActual.toFixed(2)} MXN
Total del mes anterior: ${totalAnterior.toFixed(2)} MXN
Cambio vs mes anterior: ${cambioPct === null ? "sin dato del mes anterior" : cambioPct.toFixed(1) + "%"}
Gasto por categoría (de mayor a menor):
${categoriasOrdenadas.map((c) => `- ${c.nombre}: ${c.total.toFixed(2)} MXN`).join("\n") || "(sin movimientos este mes)"}`;

  const systemPrompt = `Eres un asesor financiero personal, hablas en español de México.
Recibes datos YA CALCULADOS de un mes de gastos (no los recalcules, son exactos).
Escribe un resumen breve (5-8 líneas), tono directo y cercano, destacando cuánto se gastó,
cómo se compara con el mes anterior, y en qué categoría se concentró el gasto.
No inventes cifras que no se te dieron.`;

  let resumenTexto = "No se pudo generar el resumen narrativo este mes.";
  try {
    const respModelo = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.6",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contexto },
        ],
      }),
    });
    const data = await respModelo.json();
    resumenTexto = data.choices?.[0]?.message?.content || resumenTexto;
  } catch (err) {
    console.error("Error llamando al modelo:", err);
  }

  const htmlCategorias = categoriasOrdenadas
    .map((c) => `<li>${c.nombre}: $${c.total.toFixed(2)} MXN</li>`)
    .join("");

  const html = `
    <h2>Tu resumen de ${nombreMes}</h2>
    <p>${resumenTexto.replace(/\n/g, "<br/>")}</p>
    <h3>Gasto por categoría</h3>
    <ul>${htmlCategorias || "<li>Sin movimientos este mes</li>"}</ul>
  `;

  try {
    const respEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_ORIGEN,
        to: EMAIL_DESTINO,
        subject: `Tu resumen financiero de ${nombreMes}`,
        html,
      }),
    });
    if (!respEmail.ok) {
      const detalle = await respEmail.text();
      res.status(502).json({ error: "Error enviando correo", detalle });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }

  res.status(200).json({ ok: true, mes: nombreMes, total: totalActual });
}
