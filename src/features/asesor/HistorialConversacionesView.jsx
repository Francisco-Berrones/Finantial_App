import { useState } from "react";
import { ArrowLeft, MessageSquarePlus, Search, Trash2 } from "lucide-react";

function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtDiaSemana(iso) {
  const texto = new Date(iso).toLocaleDateString("es-MX", { weekday: "short" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function fmtFechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function agruparConversaciones(conversaciones) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const haceUnaSemana = new Date(hoy);
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

  const grupos = { Hoy: [], "Esta semana": [], Anterior: [] };
  conversaciones.forEach((c) => {
    const fecha = new Date(c.fecha_actualizacion);
    if (fecha >= hoy) grupos["Hoy"].push(c);
    else if (fecha >= haceUnaSemana) grupos["Esta semana"].push(c);
    else grupos["Anterior"].push(c);
  });
  return Object.entries(grupos).filter(([, items]) => items.length > 0);
}

export default function HistorialConversacionesView({ conversaciones, conversacionActualId, onSeleccionar, onNueva, onEliminar, onBack }) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = busqueda.trim()
    ? conversaciones.filter((c) => (c.titulo || "").toLowerCase().includes(busqueda.trim().toLowerCase()))
    : conversaciones;
  const grupos = agruparConversaciones(filtradas);

  return (
    <div className="historial-ia-root">
      <style>{`
        .historial-ia-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-hi: #E6E8EA; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;

          min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column;
          background: var(--bg); font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .historial-ia-header { position: sticky; top: 0; z-index: 10; background: var(--bg); flex-shrink: 0; }
        .historial-ia-header-row { display: flex; align-items: center; height: 64px; padding: 0 8px; position: relative; }
        .historial-ia-back { width: 40px; height: 40px; border-radius: 9999px; background: none; border: none; color: var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .historial-ia-back:active { background: var(--surface-low); }
        .historial-ia-title { position: absolute; left: 0; right: 0; text-align: center; font-size: 24px; font-weight: 700; color: var(--primary); pointer-events: none; }
        .historial-ia-main { flex: 1; padding: 16px 20px calc(32px + env(safe-area-inset-bottom)); }
        .historial-ia-nueva { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--primary); color: var(--on-primary); border: none; border-radius: 12px; padding: 16px; font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 32px; }
        .historial-ia-nueva:active { transform: scale(0.98); }
        .historial-ia-buscar { display: flex; align-items: center; gap: 8px; background: var(--surface-low); border: 1px solid rgba(198,198,205,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 32px; }
        .historial-ia-buscar input { flex: 1; border: none; background: transparent; font-family: Inter, sans-serif; font-size: 16px; color: var(--on-surface); outline: none; }
        .historial-ia-buscar input::placeholder { color: var(--outline-variant); }
        .historial-ia-grupo { margin-bottom: 32px; }
        .historial-ia-grupo-titulo { font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--outline); margin: 0 4px 8px; }
        .historial-ia-item { width: 100%; text-align: left; background: var(--surface); border: 1px solid transparent; border-radius: 12px; padding: 20px; margin-bottom: 8px; cursor: pointer; font-family: Inter, sans-serif; box-shadow: 0 4px 12px rgba(13,28,47,0.04); display: flex; flex-direction: column; gap: 4px; }
        .historial-ia-item.active { border-color: rgba(0,0,0,0.1); background: var(--surface-low); }
        .historial-ia-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .historial-ia-item-titulo { font-size: 18px; font-weight: 600; color: var(--primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .historial-ia-item-fecha { font-size: 13px; font-weight: 500; color: var(--outline); flex-shrink: 0; }
        .historial-ia-item-eliminar { align-self: flex-end; background: none; border: none; color: var(--outline); padding: 4px; cursor: pointer; display: flex; margin-top: 4px; }
        .historial-ia-empty { color: var(--on-surface-variant); font-size: 15px; text-align: center; padding: 40px 20px; }
      `}</style>

      <header className="historial-ia-header">
        <div className="historial-ia-header-row">
          <button className="historial-ia-back" data-testid="historial-back-button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="historial-ia-title">Historial de IA</h1>
        </div>
      </header>

      <main className="historial-ia-main">
        <button className="historial-ia-nueva" data-testid="conversaciones-nueva-button" onClick={onNueva}>
          <MessageSquarePlus size={20} /> Nueva consulta
        </button>

        <div className="historial-ia-buscar">
          <Search size={18} color="var(--outline)" />
          <input
            placeholder="Buscar en tus chats..."
            data-testid="historial-busqueda-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {conversaciones.length === 0 ? (
          <div className="historial-ia-empty">Todavía no tienes conversaciones.</div>
        ) : grupos.length === 0 ? (
          <div className="historial-ia-empty">No hay chats que coincidan con "{busqueda}".</div>
        ) : (
          grupos.map(([nombreGrupo, items]) => (
            <div className="historial-ia-grupo" key={nombreGrupo}>
              <h2 className="historial-ia-grupo-titulo">{nombreGrupo}</h2>
              {items.map((c) => (
                <button
                  key={c.id}
                  className={`historial-ia-item ${c.id === conversacionActualId ? "active" : ""}`}
                  data-testid={`conversaciones-item-${c.id}`}
                  onClick={() => onSeleccionar(c.id)}
                >
                  <div className="historial-ia-item-top">
                    <span className="historial-ia-item-titulo">{c.titulo || "Nueva conversación"}</span>
                    <span className="historial-ia-item-fecha">
                      {nombreGrupo === "Hoy" ? fmtHora(c.fecha_actualizacion) : nombreGrupo === "Esta semana" ? fmtDiaSemana(c.fecha_actualizacion) : fmtFechaCorta(c.fecha_actualizacion)}
                    </span>
                  </div>
                  <span
                    className="historial-ia-item-eliminar"
                    data-testid={`conversaciones-eliminar-${c.id}`}
                    onClick={(e) => { e.stopPropagation(); onEliminar(c.id); }}
                  >
                    <Trash2 size={15} />
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
