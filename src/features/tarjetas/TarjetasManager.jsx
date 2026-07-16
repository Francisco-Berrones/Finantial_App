import { forwardRef, useImperativeHandle, useState } from "react";
import { CreditCard } from "lucide-react";
import TarjetaRow from "./TarjetaRow";
import NuevaTarjetaModal from "./NuevaTarjetaModal";

const TarjetasManager = forwardRef(function TarjetasManager({ tarjetas, session, addTarjeta, deleteTarjeta, onChange, onVerTarjeta, onPagarTarjeta, movimientos = [], msiActivas = [] }, ref) {
  const [showAdd, setShowAdd] = useState(false);

  useImperativeHandle(ref, () => ({
    abrirFormulario: () => setShowAdd(true),
  }));

  const handleAdd = async ({ nombre, banco, lineaTotal, saldoUsado, diaCorte, diaPago, color }) => {
    const ok = await addTarjeta({ nombre, banco, lineaTotal, saldoUsado, diaCorte, diaPago, color, userId: session.user.id });
    if (ok) await onChange();
    return ok;
  };

  const handleDelete = async (id) => {
    const ok = await deleteTarjeta(id);
    if (ok) await onChange();
  };

  return (
    <div className="tarjetas-sec-root">
      <style>{`
        .tarjetas-sec-root {
          --surface: #FFFFFF; --surface-low: #F2F4F6; --surface-hi: #E6E8EA;
          --primary: #000000; --primary-container: #131B2E; --on-primary: #FFFFFF;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E; --on-secondary-container: #57657B;
          --outline: #76777D; --outline-variant: #C6C6CD; --expense: #BA1A1A;
          font-family: Inter, sans-serif; color: var(--on-surface); margin-top: 28px;
        }
        .app-root[data-theme="dark"] .tarjetas-sec-root {
          --surface: #1B1F23; --surface-low: #15181B; --surface-hi: #262B30;
          --primary: #DAE2FD; --primary-container: #2A3550; --on-primary: #131B2E;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0; --on-secondary-container: #B8C6E0;
          --outline: #8D9199; --outline-variant: #43474E; --expense: #FFB4AB;
        }
        .tarjetas-sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .tarjetas-sec-head svg { color: var(--primary-container); }
        .tarjetas-sec-titulo { font-size: 18px; font-weight: 600; color: var(--on-surface); }
        .tarjetas-sec-list { display: flex; flex-direction: column; gap: 14px; }
      `}</style>

      <div className="tarjetas-sec-head">
        <CreditCard size={20} />
        <span className="tarjetas-sec-titulo">Tarjetas de Crédito</span>
      </div>

      <div className="tarjetas-sec-list">
        {tarjetas.map((t) => (
          <TarjetaRow
            key={t.id}
            tarjeta={t}
            movimientos={movimientos}
            msiActivas={msiActivas}
            onDelete={handleDelete}
            onClick={() => onVerTarjeta(t.id)}
            onPagarAhora={onPagarTarjeta}
          />
        ))}
      </div>

      {showAdd && <NuevaTarjetaModal onGuardar={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
});

export default TarjetasManager;
