import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import CuentasManager from "../features/cuentas/CuentasManager";
import TarjetasManager from "../features/tarjetas/TarjetasManager";
import SuscripcionesLinkCard from "../features/suscripciones/SuscripcionesLinkCard";
import TipoActivoModal from "../features/cuentas/TipoActivoModal";

export default function CuentasView({
  cuentas,
  tarjetas,
  deleteCuenta,
  addTarjeta,
  deleteTarjeta,
  session,
  onChange,
  onVerTarjeta,
  onPagarTarjeta,
  movimientos,
  msiActivas,
  suscripciones,
  onAbrirSuscripciones,
  onAbrirNuevaCuenta,
}) {
  const tarjetasSectionRef = useRef(null);
  const tarjetasManagerRef = useRef(null);
  const [mostrarTipoModal, setMostrarTipoModal] = useState(false);

  const handleSeleccionarTipo = (tipo) => {
    setMostrarTipoModal(false);
    if (tipo === "cuenta") {
      onAbrirNuevaCuenta();
    } else {
      tarjetasSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      tarjetasManagerRef.current?.abrirFormulario();
    }
  };

  return (
    <div className="cuentas-nuevo-root">
      <style>{`
        .cuentas-nuevo-root {
          font-family: Inter, sans-serif; color: #1A1C1E; padding: 16px;
        }
        .cuentas-nuevo-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .cuentas-nuevo-titulo { font-size: 24px; font-weight: 700; margin: 0; }
        .cuentas-nuevo-sub { font-size: 14px; color: #44474E; margin: 4px 0 24px; }
        .cuentas-nuevo-add-btn { background: #000000; color: #FFFFFF; border: none; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); flex-shrink: 0; }
        .cuentas-nuevo-add-btn:active { transform: scale(0.95); }
      `}</style>

      <div className="cuentas-nuevo-head">
        <div>
          <h2 className="cuentas-nuevo-titulo">Mis Activos</h2>
          <p className="cuentas-nuevo-sub">Gestiona tus fondos y créditos</p>
        </div>
        <button
          className="cuentas-nuevo-add-btn"
          data-testid="cuentas-nueva-cuenta-button"
          onClick={() => setMostrarTipoModal(true)}
        >
          <Plus size={20} />
        </button>
      </div>

      <CuentasManager cuentas={cuentas} deleteCuenta={deleteCuenta} onChange={onChange} />

      <div ref={tarjetasSectionRef}>
        <TarjetasManager
          ref={tarjetasManagerRef}
          tarjetas={tarjetas}
          session={session}
          addTarjeta={addTarjeta}
          deleteTarjeta={deleteTarjeta}
          onChange={onChange}
          onVerTarjeta={onVerTarjeta}
          onPagarTarjeta={onPagarTarjeta}
          movimientos={movimientos}
          msiActivas={msiActivas}
        />
      </div>

      <SuscripcionesLinkCard suscripciones={suscripciones} onClick={onAbrirSuscripciones} />

      {mostrarTipoModal && (
        <TipoActivoModal
          onSeleccionar={handleSeleccionarTipo}
          onClose={() => setMostrarTipoModal(false)}
        />
      )}
    </div>
  );
}
