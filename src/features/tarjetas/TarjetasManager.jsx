import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import TarjetaRow from "./TarjetaRow";

export default function TarjetasManager({ tarjetas, session, addTarjeta, deleteTarjeta, onChange, onVerTarjeta }) {
  const [nombre, setNombre] = useState("");
  const [banco, setBanco] = useState("");
  const [lineaTotal, setLineaTotal] = useState("");
  const [saldoUsado, setSaldoUsado] = useState("");
  const [diaCorte, setDiaCorte] = useState("");
  const [diaPago, setDiaPago] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    if (!nombre.trim()) return;
    const ok = await addTarjeta({ nombre, banco, lineaTotal, saldoUsado, diaCorte, diaPago, userId: session.user.id });
    if (ok) {
      setNombre("");
      setBanco("");
      setLineaTotal("");
      setSaldoUsado("");
      setDiaCorte("");
      setDiaPago("");
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
          <TarjetaRow key={t.id} tarjeta={t} onDelete={handleDelete} onClick={() => onVerTarjeta(t.id)} />
        ))}
      </div>
      <AnimatePresence initial={false}>
        {!showAdd ? (
          <motion.button
            key="add-link"
            className="add-link"
            data-testid="tarjetas-add-link"
            onClick={() => setShowAdd(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Plus size={13} /> agregar tarjeta
          </motion.button>
        ) : (
          <motion.div
            key="add-form"
            className="form-box"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
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
              <input
                placeholder="Día de corte (1-31, opcional)"
                inputMode="numeric"
                style={{ flex: 1 }}
                data-testid="tarjetas-dia-corte-input"
                value={diaCorte}
                onChange={(e) => setDiaCorte(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <input
                placeholder="Día de pago (1-31, opcional)"
                inputMode="numeric"
                style={{ flex: 1 }}
                data-testid="tarjetas-dia-pago-input"
                value={diaPago}
                onChange={(e) => setDiaPago(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn dark" data-testid="tarjetas-save-button" onClick={handleAdd}>Guardar</button>
              <button className="btn" data-testid="tarjetas-cancel-button" onClick={() => setShowAdd(false)}>Cancelar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
