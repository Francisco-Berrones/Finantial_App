import { fmt } from "../shared/format";
import CuentaRow from "../features/cuentas/CuentaRow";
import TarjetaRow from "../features/tarjetas/TarjetaRow";
import MovimientoRow from "../features/movimientos/MovimientoRow";

export default function InicioView({ cuentas, tarjetas, movimientos, onNavigateCuentas }) {
  const totalAhorro = cuentas.reduce((s, c) => s + Number(c.saldo), 0);
  const totalDisponible = tarjetas.reduce((s, t) => s + (Number(t.linea_total) - Number(t.saldo_usado)), 0);
  const hayCuentas = cuentas.length > 0;
  const hayTarjetas = tarjetas.length > 0;

  return (
    <>
      <div className="summary-row">
        <div className="summary-box">
          <div className="summary-label">Ahorro total</div>
          <div className="summary-value mono">{fmt(totalAhorro)}</div>
        </div>
        <div className="summary-box credito">
          <div className="summary-label">Crédito disponible</div>
          <div className="summary-value mono">{fmt(totalDisponible)}</div>
        </div>
      </div>

      {!hayCuentas && !hayTarjetas && (
        <div className="empty-state">
          Todavía no tienes cuentas ni tarjetas registradas.
          <br />
          <button className="btn dark" data-testid="inicio-agregar-primera-button" onClick={onNavigateCuentas}>
            Agregar la primera
          </button>
        </div>
      )}

      {hayCuentas && (
        <>
          <div className="section-title">Cuentas de ahorro</div>
          <div className="cuenta-list">
            {cuentas.map((c) => (
              <CuentaRow key={c.id} cuenta={c} />
            ))}
          </div>
        </>
      )}

      {hayTarjetas && (
        <>
          <div className="section-title">Tarjetas de crédito</div>
          <div className="tarjeta-list">
            {tarjetas.map((t) => (
              <TarjetaRow key={t.id} tarjeta={t} />
            ))}
          </div>
        </>
      )}

      <div className="section-title">Últimos movimientos</div>
      {movimientos.length === 0 ? (
        <div style={{ padding: "0 16px", color: "var(--ink-soft)", fontSize: 14 }}>
          Aún no registras movimientos.
        </div>
      ) : (
        <div className="mov-list">
          {movimientos.slice(0, 6).map((m) => (
            <MovimientoRow key={m.id} movimiento={m} />
          ))}
        </div>
      )}
    </>
  );
}
