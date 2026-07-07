import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown, Trash2 } from "lucide-react";
import { fmt } from "../../shared/format";

export default function SuscripcionesManager({ suscripciones, cuentas, tarjetas, categorias, session, addSuscripcion, deleteSuscripcion, onChange }) {
  const [showAdd, setShowAdd] = useState(false);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [diaCobro, setDiaCobro] = useState("");
  const [mesCobro, setMesCobro] = useState("");
  const [targetTipo, setTargetTipo] = useState("tarjeta");
  const [targetId, setTargetId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const targets = targetTipo === "tarjeta" ? tarjetas : cuentas;

  const resetForm = () => {
    setNombre("");
    setMonto("");
    setFrecuencia("mensual");
    setDiaCobro("");
    setMesCobro("");
    setTargetTipo("tarjeta");
    setTargetId("");
    setCategoriaId("");
  };

  const handleAdd = async () => {
    if (!nombre.trim() || !monto || !diaCobro || !targetId) return;
    const ok = await addSuscripcion({
      nombre,
      monto,
      frecuencia,
      diaCobro,
      mesCobro,
      targetTipo,
      targetId,
      categoriaId,
      userId: session.user.id,
    });
    if (ok) {
      resetForm();
      setShowAdd(false);
      await onChange();
    }
  };

  const handleDelete = async (id) => {
    const ok = await deleteSuscripcion(id);
    if (ok) await onChange();
  };

  return (
    <>
      <div className="section-title" style={{ margin: "16px 0 4px" }}>Suscripciones</div>
      <div className="cuenta-list" style={{ padding: 0, marginBottom: 12 }}>
        {suscripciones.length === 0 && !showAdd && (
          <div className="mov-sub" style={{ padding: "0 0 8px" }}>No tienes suscripciones registradas.</div>
        )}
        {suscripciones.map((s) => (
          <div className="cuenta-row-card" key={s.id} data-testid={`suscripcion-row-${s.id}`}>
            <div className="cuenta-row-top">
              <div>
                <div className="cuenta-row-name">{s.nombre}</div>
                <div className="cuenta-row-saldo">
                  {fmt(s.monto)} · {s.frecuencia === "anual" ? "anual" : "mensual"} · {s.target_nombre}
                </div>
                <div className="mov-sub">
                  {s.pendiente_confirmar ? "Pendiente de confirmar" : `Próximo cobro en ${s.dias_para_cobro} días`}
                  {s.categoria_nombre ? ` · ${s.categoria_nombre}` : ""}
                </div>
              </div>
              <button
                className="row-delete-btn"
                data-testid={`suscripcion-delete-button-${s.id}`}
                onClick={() => handleDelete(s.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {!showAdd ? (
          <motion.button
            key="add-link"
            className="add-link"
            data-testid="suscripciones-add-link"
            onClick={() => setShowAdd(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Plus size={13} /> agregar suscripción
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
              placeholder="Nombre (ej. Netflix)"
              data-testid="suscripciones-nombre-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              placeholder="Monto"
              inputMode="decimal"
              data-testid="suscripciones-monto-input"
              value={monto}
              onChange={(e) => setMonto(e.target.value.replace(/[^0-9.]/g, ""))}
            />

            <div className="select-wrapper">
              <select
                className="target-select"
                data-testid="suscripciones-frecuencia-select"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            <input
              placeholder="Día de cobro (1-31)"
              inputMode="numeric"
              data-testid="suscripciones-dia-cobro-input"
              value={diaCobro}
              onChange={(e) => setDiaCobro(e.target.value.replace(/[^0-9]/g, ""))}
            />

            {frecuencia === "anual" && (
              <input
                placeholder="Mes de cobro (1-12)"
                inputMode="numeric"
                data-testid="suscripciones-mes-cobro-input"
                value={mesCobro}
                onChange={(e) => setMesCobro(e.target.value.replace(/[^0-9]/g, ""))}
              />
            )}

            <div className="select-wrapper">
              <select
                className="target-select"
                data-testid="suscripciones-target-tipo-select"
                value={targetTipo}
                onChange={(e) => {
                  setTargetTipo(e.target.value);
                  setTargetId("");
                }}
              >
                <option value="tarjeta">Cargar a una tarjeta</option>
                <option value="cuenta">Cargar a una cuenta</option>
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            <div className="select-wrapper">
              <select
                className="target-select"
                data-testid="suscripciones-target-select"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="" disabled>
                  Elige {targetTipo === "tarjeta" ? "una tarjeta" : "una cuenta"}
                </option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}{t.banco ? ` ${t.banco}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            <div className="select-wrapper">
              <select
                className="target-select"
                data-testid="suscripciones-categoria-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn dark" data-testid="suscripciones-save-button" onClick={handleAdd}>Guardar</button>
              <button
                className="btn"
                data-testid="suscripciones-cancel-button"
                onClick={() => { resetForm(); setShowAdd(false); }}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
