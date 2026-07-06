import { useState } from "react";
import { Plus } from "lucide-react";
import TarjetaRow from "./TarjetaRow";

export default function TarjetasManager({ tarjetas, session, addTarjeta, deleteTarjeta, onChange }) {
  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [lineaTotal, setLineaTotal] = useState("");
  const [saldoUsado, setSaldoUsado] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!nombre.trim()) return;
    const ok = await addTarjeta({ nombre, banco, lineaTotal, saldoUsado, userId: session.user.id });
    if (ok) {
      setNombre("");
      setBanco("");
      setLineaTotal("");
      setSaldoUsado("");
      setShowAdd(false);
      await onChange();
    }
  };

  const handleDelete = async (id) => {
    const ok = await deleteTarjeta(id);
    if (ok) await onChange();
  };

  return (
    <>
      <div className="section-title" style={{ margin: "24px 0 4px" }}>Tarjetas de crédito</div>
      <div className="tarjeta-list" style={{ padding: 0, marginBottom: 12 }}>
        {tarjetas.map((t) => (
          <TarjetaRow key={t.id} tarjeta={t} onDelete={handleDelete} />
        ))}
      </div>
      {!showAdd ? (
        <button className="add-link" data-testid="tarjetas-add-link" onClick={() => setShowAdd(true)}>
          <Plus size={13} /> agregar tarjeta
        </button>
      ) : (
        <div className="form-box">
          <input
            placeholder="Nombre (ej. Oro)"
            data-testid="tarjetas-nombre-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Banco (ej. Banorte)"
            data-testid="tarjetas-banco-input"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
          />
          <input
            placeholder="Línea de crédito total"
            inputMode="decimal"
            data-testid="tarjetas-linea-input"
            value={lineaTotal}
            onChange={(e) => setLineaTotal(e.target.value)}
          />
          <input
            placeholder="Saldo ya usado (opcional)"
            inputMode="decimal"
            data-testid="tarjetas-usado-input"
            value={saldoUsado}
            onChange={(e) => setSaldoUsado(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn dark" data-testid="tarjetas-save-button" onClick={handleAdd}>Guardar</button>
            <button className="btn" data-testid="tarjetas-cancel-button" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
