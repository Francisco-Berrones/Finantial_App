import { PiggyBank } from "lucide-react";
import CuentaRow from "./CuentaRow";

export default function CuentasManager({ cuentas, deleteCuenta, onChange }) {
  const handleDelete = async (id) => {
    const ok = await deleteCuenta(id);
    if (ok) await onChange();
  };

  return (
    <div className="cuentas-sec-root">
      <style>{`
        .cuentas-sec-root {
          --surface: #FFFFFF; --surface-low: #F2F4F6;
          --primary-container: #131B2E;
          --secondary-container: #D5E3FD; --on-secondary-container: #57657B;
          --on-surface: #1A1C1E; --expense: #BA1A1A;
          font-family: Inter, sans-serif; color: var(--on-surface);
        }
        .cuentas-sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .cuentas-sec-head svg { color: var(--primary-container); }
        .cuentas-sec-titulo { font-size: 18px; font-weight: 600; color: var(--on-surface); }
        .cuentas-sec-grid { display: flex; flex-direction: column; gap: 12px; }
      `}</style>

      <div className="cuentas-sec-head">
        <PiggyBank size={20} />
        <span className="cuentas-sec-titulo">Cuentas de Ahorro</span>
      </div>

      <div className="cuentas-sec-grid">
        {cuentas.map((c) => (
          <CuentaRow key={c.id} cuenta={c} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
