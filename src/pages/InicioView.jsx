import { CreditCard, TrendingDown, TrendingUp } from "lucide-react";
import { fmt } from "../shared/format";
import { iconoPorCategoria } from "../shared/categoriaIconos";
import { proximaTarjetaAPagar } from "../shared/calcularPagoTarjeta";
import MovimientoCard from "../features/movimientos/MovimientoCard";

const TIPOS_GASTO = ["gasto_credito", "gasto_debito", "pago_tarjeta"];

function claveMes(fecha) {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mesCorto(clave) {
  const [anio, mes] = clave.split("-").map(Number);
  const texto = new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", { month: "short" }).replace(".", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// El mini-gráfico es solo decorativo: reacomoda el mes actual (el último
// cronológicamente) al centro de la fila, en vez de dejarlo siempre pegado
// a la orilla derecha.
function centrarActual(meses) {
  const actual = meses[meses.length - 1];
  const resto = meses.slice(0, -1);
  const medio = Math.floor(resto.length / 2);
  return [...resto.slice(0, medio), actual, ...resto.slice(medio)];
}

function calcularMayorCategoria(movimientos) {
  const porMesYCategoria = {};
  movimientos.forEach((m) => {
    if (m.tipo_accion !== "gasto_credito" && m.tipo_accion !== "gasto_debito") return;
    const clave = claveMes(m.fecha);
    const cat = m.categoria?.nombre || "Sin categoría";
    porMesYCategoria[clave] = porMesYCategoria[clave] || {};
    porMesYCategoria[clave][cat] = (porMesYCategoria[clave][cat] || 0) + Number(m.monto);
  });

  const ahora = new Date();
  const claveActual = claveMes(ahora);
  const entradasMesActual = Object.entries(porMesYCategoria[claveActual] || {});
  if (entradasMesActual.length === 0) return null;

  entradasMesActual.sort((a, b) => b[1] - a[1]);
  const [nombre, total] = entradasMesActual[0];

  const claveAnterior = claveMes(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1));
  const totalAnterior = (porMesYCategoria[claveAnterior] || {})[nombre] || 0;
  const cambioPct = totalAnterior > 0 ? ((total - totalAnterior) / totalAnterior) * 100 : null;

  const ultimosMeses = [];
  for (let i = 4; i >= 0; i--) {
    const clave = claveMes(new Date(ahora.getFullYear(), ahora.getMonth() - i, 1));
    ultimosMeses.push({ clave, valor: (porMesYCategoria[clave] || {})[nombre] || 0 });
  }
  const maxUltimosMeses = Math.max(...ultimosMeses.map((m) => m.valor), 1);

  return { nombre, total, cambioPct, ultimosMeses, maxUltimosMeses };
}

export default function InicioView({ cuentas, tarjetas, movimientos, msiActivas = [], onNavigateCuentas, onVerTarjeta, onAbrirResumen, onAbrirHistorial, onPagarTarjeta }) {
  const totalAhorro = cuentas.reduce((s, c) => s + Number(c.saldo), 0);
  const hayCuentas = cuentas.length > 0;
  const hayTarjetas = tarjetas.length > 0;

  const mayorCategoria = calcularMayorCategoria(movimientos);
  const IconoMayorCategoria = mayorCategoria ? iconoPorCategoria(mayorCategoria.nombre) : null;
  const barrasSparkline = mayorCategoria ? centrarActual(mayorCategoria.ultimosMeses) : [];

  const ahora = new Date();
  const claveActual = claveMes(ahora);
  const movimientosMes = movimientos.filter((m) => claveMes(m.fecha) === claveActual);
  const totalIngresosMes = movimientosMes.filter((m) => m.tipo_accion === "ingreso_cuenta").reduce((s, m) => s + Number(m.monto), 0);
  const totalGastosMes = movimientosMes.filter((m) => TIPOS_GASTO.includes(m.tipo_accion)).reduce((s, m) => s + Number(m.monto), 0);
  const maxFlujoMes = Math.max(totalIngresosMes, totalGastosMes, 1);

  const proximoVencimiento = proximaTarjetaAPagar(tarjetas, movimientos, msiActivas);

  return (
    <div className="inicio-nuevo-root">
      <style>{`
        .inicio-nuevo-root {
          --bg: #F7F9FB; --surface: #FFFFFF; --surface-hi: #E0E3E5; --surface-low: #F2F4F6;
          --primary: #000000; --on-primary: #FFFFFF; --primary-container: #131B2E; --primary-fixed: #DAE2FD;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD;
          --income: #1B5E20; --expense: #BA1A1A;
          font-family: Inter, sans-serif; color: var(--on-surface); padding: 16px;
        }
        .inicio-saldo-label { font-size: 13px; font-weight: 500; color: var(--on-surface-variant); margin: 0 0 4px; }
        .inicio-saldo-valor { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; color: var(--primary); margin: 0 0 24px; }

        .inicio-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .inicio-section-titulo { font-size: 18px; font-weight: 600; color: var(--primary); }
        .inicio-section-link { background: none; border: none; color: var(--primary); font-family: Inter, sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; }
        .inicio-section-link:hover { text-decoration: underline; }

        .inicio-card { background: var(--surface); border: 1px solid var(--surface-low); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(13,28,47,0.04); }

        .inicio-gastos-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; transition: transform 0.15s ease; }
        .inicio-gastos-card:active { transform: scale(0.98); }
        .inicio-gastos-label { font-size: 13px; color: var(--on-surface-variant); margin: 0 0 4px; }
        .inicio-gastos-nombre { font-size: 18px; font-weight: 600; color: var(--primary); margin: 0 0 6px; display: flex; align-items: center; gap: 8px; }
        .inicio-gastos-nombre-icono { width: 28px; height: 28px; border-radius: 9999px; background: var(--secondary-container); color: var(--on-secondary-container); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .inicio-gastos-tendencia { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500; }
        .inicio-gastos-tendencia.sube { color: var(--expense); }
        .inicio-gastos-tendencia.baja { color: var(--income); }
        .inicio-gastos-barras { display: flex; align-items: flex-end; gap: 5px; height: 64px; flex-shrink: 0; }
        .inicio-gastos-barra { width: 8px; min-height: 6px; border-radius: 9999px; background: var(--outline-variant); }
        .inicio-gastos-barra.actual { background: var(--primary); }

        .inicio-balance-fila { margin-bottom: 14px; }
        .inicio-balance-fila:last-child { margin-bottom: 0; }
        .inicio-balance-fila-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .inicio-balance-fila-top span:first-child { color: var(--on-surface-variant); }
        .inicio-balance-fila-top span:last-child { color: var(--primary); }
        .inicio-balance-barra-fondo { height: 8px; width: 100%; background: var(--surface-hi); border-radius: 9999px; overflow: hidden; }
        .inicio-balance-barra { height: 100%; border-radius: 9999px; background: var(--primary); }
        .inicio-balance-barra.gastos { background: var(--outline); }

        .inicio-vencimiento-card { background: var(--primary-container); color: #fff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 6px 16px rgba(19,27,46,0.25); }
        .inicio-vencimiento-eyebrow { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
        .inicio-vencimiento-titulo { font-size: 16px; font-weight: 600; color: #fff; margin: 0 0 4px; }
        .inicio-vencimiento-monto { font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
        .inicio-vencimiento-btn { margin-top: 16px; width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #fff; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
        .inicio-vencimiento-btn:active { background: rgba(255,255,255,0.2); }

        .inicio-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; padding: 20px; border: 1.5px dashed var(--outline-variant); border-radius: 12px; margin-bottom: 20px; }
        .inicio-empty button { margin-top: 12px; background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
        .inicio-mov-empty { color: var(--on-surface-variant); font-size: 14px; padding: 8px 4px; }
      `}</style>

      <p className="inicio-saldo-label">Saldo Total</p>
      <p className="inicio-saldo-valor mono">{fmt(totalAhorro)}</p>

      {!hayCuentas && !hayTarjetas ? (
        <div className="inicio-empty">
          Todavía no tienes cuentas ni tarjetas registradas.
          <br />
          <button data-testid="inicio-agregar-primera-button" onClick={onNavigateCuentas}>Agregar la primera</button>
        </div>
      ) : (
        <>
          {mayorCategoria && (
            <section>
              <div className="inicio-section-head">
                <h2 className="inicio-section-titulo">Análisis de Gastos</h2>
                <button className="inicio-section-link" data-testid="inicio-resumen-button" onClick={onAbrirResumen}>Detalles</button>
              </div>
              <div
                className="inicio-card inicio-gastos-card"
                data-testid="inicio-gastos-card"
                onClick={onAbrirResumen}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <p className="inicio-gastos-label">Mayor categoría</p>
                  <p className="inicio-gastos-nombre">
                    <span className="inicio-gastos-nombre-icono"><IconoMayorCategoria size={15} /></span>
                    {mayorCategoria.nombre}
                  </p>
                  {mayorCategoria.cambioPct !== null && (
                    <div className={`inicio-gastos-tendencia ${mayorCategoria.cambioPct >= 0 ? "sube" : "baja"}`}>
                      {mayorCategoria.cambioPct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      {mayorCategoria.cambioPct >= 0 ? "+" : ""}{mayorCategoria.cambioPct.toFixed(0)}% vs mes anterior
                    </div>
                  )}
                </div>
                <div className="inicio-gastos-barras">
                  {barrasSparkline.map((m) => (
                    <div
                      key={m.clave}
                      className={`inicio-gastos-barra ${m.clave === claveActual ? "actual" : ""}`}
                      style={{ height: `${Math.max(20, (m.valor / mayorCategoria.maxUltimosMeses) * 100)}%` }}
                      title={`${mesCorto(m.clave)}: ${fmt(m.valor)}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <section>
            <div className="inicio-section-head">
              <h2 className="inicio-section-titulo">Balance del Mes</h2>
              <span className="inicio-section-link" style={{ cursor: "default" }}>{mesCorto(claveActual)}</span>
            </div>
            <div className="inicio-card">
              <div className="inicio-balance-fila">
                <div className="inicio-balance-fila-top">
                  <span>Ingresos</span>
                  <span className="mono">{fmt(totalIngresosMes)}</span>
                </div>
                <div className="inicio-balance-barra-fondo">
                  <div className="inicio-balance-barra" style={{ width: `${(totalIngresosMes / maxFlujoMes) * 100}%` }} />
                </div>
              </div>
              <div className="inicio-balance-fila">
                <div className="inicio-balance-fila-top">
                  <span>Gastos</span>
                  <span className="mono">{fmt(totalGastosMes)}</span>
                </div>
                <div className="inicio-balance-barra-fondo">
                  <div className="inicio-balance-barra gastos" style={{ width: `${(totalGastosMes / maxFlujoMes) * 100}%` }} />
                </div>
              </div>
            </div>
          </section>

          {proximoVencimiento && (
            <div className="inicio-vencimiento-card" data-testid="inicio-vencimiento-card">
              <div className="inicio-vencimiento-eyebrow">
                <CreditCard size={16} /> Próximo vencimiento
              </div>
              <div
                onClick={() => onVerTarjeta(proximoVencimiento.tarjeta.id)}
                style={{ cursor: "pointer" }}
                data-testid="inicio-vencimiento-ver-tarjeta"
              >
                <h3 className="inicio-vencimiento-titulo">
                  {proximoVencimiento.tarjeta.nombre} · {proximoVencimiento.pago.dias === 0 ? "hoy" : `en ${proximoVencimiento.pago.dias} días`}
                </h3>
                <p className="inicio-vencimiento-monto mono">{fmt(proximoVencimiento.pago.monto)}</p>
              </div>
              <button
                className="inicio-vencimiento-btn"
                data-testid="inicio-pagar-ahora-button"
                onClick={() => onPagarTarjeta(proximoVencimiento.tarjeta.id)}
              >
                Pagar Ahora
              </button>
            </div>
          )}
        </>
      )}

      <section>
        <div className="inicio-section-head">
          <h2 className="inicio-section-titulo">Movimientos Recientes</h2>
          <button className="inicio-section-link" data-testid="inicio-vertodo-button" onClick={onAbrirHistorial}>Ver todo</button>
        </div>
        {movimientos.length === 0 ? (
          <div className="inicio-mov-empty">Aún no registras movimientos.</div>
        ) : (
          movimientos.slice(0, 5).map((m) => <MovimientoCard key={m.id} movimiento={m} />)
        )}
      </section>
    </div>
  );
}
