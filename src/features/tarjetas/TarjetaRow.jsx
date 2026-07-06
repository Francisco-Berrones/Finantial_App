import { fmt } from "../../shared/format";

const BANCO_ICON_CLASS = {
  banorte: "tarjeta-row-icon--banorte",
  revolut: "tarjeta-row-icon--revolut",
  nu: "tarjeta-row-icon--nu",
};

function iconClassFor(banco) {
  const key = (banco || "").trim().toLowerCase();
  return BANCO_ICON_CLASS[key] || "";
}

export default function TarjetaRow({ tarjeta }) {
  const disponible = tarjeta.linea_total - tarjeta.saldo_usado;
  return (
    <div className="tarjeta-row-card" data-testid={`tarjeta-row-${tarjeta.id}`}>
      <div className="tarjeta-row-top">
        <div className="tarjeta-row-left">
          <div className={`tarjeta-row-icon ${iconClassFor(tarjeta.banco)}`}>
            <div className="tarjeta-row-icon-dots">
              <span />
              <span />
            </div>
          </div>
          <div>
            <div className="tarjeta-row-name">{tarjeta.nombre}</div>
            {tarjeta.banco && <div className="tarjeta-row-banco">{tarjeta.banco}</div>}
          </div>
        </div>
        <div className="decorative-toggle" />
      </div>
      <div className="tarjeta-row-stats">
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Línea</div>
          <div className="tarjeta-row-stat-value mono">{fmt(tarjeta.linea_total)}</div>
        </div>
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Usado</div>
          <div className="tarjeta-row-stat-value mono">{fmt(tarjeta.saldo_usado)}</div>
        </div>
        <div className="tarjeta-row-stat">
          <div className="tarjeta-row-stat-label">Disponible</div>
          <div className="tarjeta-row-stat-value mono">{fmt(disponible)}</div>
        </div>
      </div>
    </div>
  );
}
