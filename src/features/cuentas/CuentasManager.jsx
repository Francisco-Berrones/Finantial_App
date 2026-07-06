import { useState } from "react";
import { Plus } from "lucide-react";
import CuentaRow from "./CuentaRow";

export default function CuentasManager({ cuentas, session, addCuenta, deleteCuenta, onChange }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!nombre.trim()) return;
    const ok = await addCuenta({ nombre, saldo, userId: session.user.id });
    if (ok) {
      setNombre("");
      setSaldo("");
      setShowAdd(false);
      await onChange();
    }
  };

  const handleDelete = async (id) => {
    const ok = await deleteCuenta(id);
    if (ok) await onChange();
  };

  return (
    <>
      <div className="section-title" style={{ margin: "16px 0 4px" }}>Cuentas de ahorro</div>
      <div className="cuenta-list" style={{ padding: 0, marginBottom: 12 }}>
        {cuentas.map((c) => (
          <CuentaRow key={c.id} cuenta={c} onDelete={handleDelete} />
        ))}
      </div>
      {!showAdd ? (
        <button className="add-link" data-testid="cuentas-add-link" onClick={() => setShowAdd(true)}>
          <Plus size={13} /> agregar cuenta
        </button>
      ) : (
        <div className="form-box">
          <input
            placeholder="Nombre (ej. Cuenta personal)"
            data-testid="cuentas-nombre-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Saldo inicial"
            inputMode="decimal"
            data-testid="cuentas-saldo-input"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn dark" data-testid="cuentas-save-button" onClick={handleAdd}>Guardar</button>
            <button className="btn" data-testid="cuentas-cancel-button" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
