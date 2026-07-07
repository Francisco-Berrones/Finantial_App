import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Pencil, Plus } from "lucide-react";
import { fmt } from "../../shared/format";
import { diasHasta, formatDiasFaltantes } from "../../shared/dateUtils";
import { useMsiDetalle } from "./useMsiDetalle";

export default function TarjetaDetalleView({ tarjeta, categorias = [], crearCategoria, onBack, onGuardarCortePago, onRegistrada }) {
  const { compras, cargando, fetchMsi, registrarCompra } = useMsiDetalle(tarjeta?.id);
  const [editando, setEditando] = useState(false);
  const [diaCorte, setDiaCorte] = useState("");
  const [diaPago, setDiaPago] = useState("");

  const [showAddMsi, setShowAddMsi] = useState(false);
  const [descripcionMsi, setDescripcionMsi] = useState("");
  const [montoMsi, setMontoMsi] = useState("");
  const [mesesMsi, setMesesMsi] = useState("");
  const [categoriaMsiId, setCategoriaMsiId] = useState("");
  const [creandoCategoriaMsi, setCreandoCategoriaMsi] = useState(false);
  const [nuevaCategoriaMsi, setNuevaCategoriaMsi] = useState("");

  const handleCrearCategoriaMsi = async () => {
    if (!nuevaCategoriaMsi.trim()) return;
    const creada = await crearCategoria(nuevaCategoriaMsi);
    if (creada) {
      setCategoriaMsiId(creada.id);
      setNuevaCategoriaMsi("");
      setCreandoCategoriaMsi(false);
    }
  };

  useEffect(() => { fetchMsi(); }, [fetchMsi]);

  if (!tarjeta) return null;

  const diasCorte = diasHasta(tarjeta.dia_corte);
  const diasPago = diasHasta(tarjeta.dia_pago);

  const abrirEdicion = () => {
    setDiaCorte(tarjeta.dia_corte ? String(tarjeta.dia_corte) : "");
    setDiaPago(tarjeta.dia_pago ? String(tarjeta.dia_pago) : "");
    setEditando(true);
  };

  const guardarCortePago = async () => {
    const ok = await onGuardarCortePago(tarjeta.id, { diaCorte, diaPago });
    if (ok) setEditando(false);
  };

  const handleAddMsi = async () => {
    const ok = await registrarCompra({
      tarjetaId: tarjeta.id,
      monto: montoMsi,
      meses: mesesMsi,
      descripcion: descripcionMsi,
      categoriaId: categoriaMsiId || null,
    });
    if (ok) {
      setDescripcionMsi("");
      setMontoMsi("");
      setMesesMsi("");
      setCategoriaMsiId("");
      setCreandoCategoriaMsi(false);
      setNuevaCategoriaMsi("");
      setShowAddMsi(false);
      await fetchMsi();
      await onRegistrada?.();
    }
  };

  return (
    <div>
      <div className="nuevo-mov-header">
        <button className="nuevo-mov-back" data-testid="tarjeta-detalle-back-button" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <span className="nuevo-mov-title">{tarjeta.banco}</span>
      </div>

      <div className="nuevo-mov-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="section-title" style={{ margin: "0 0 8px" }}>Corte y pago</div>
          {!editando && (
            <button
              className="row-delete-btn"
              data-testid="tarjeta-detalle-editar-button"
              onClick={abrirEdicion}
              title="Editar corte y pago"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {editando ? (
            <motion.div
              key="editar-corte-pago"
              className="form-box"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Día de corte (1-31)"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  data-testid="tarjeta-detalle-dia-corte-input"
                  value={diaCorte}
                  onChange={(e) => setDiaCorte(e.target.value.replace(/[^0-9]/g, ""))}
                />
                <input
                  placeholder="Día de pago (1-31)"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  data-testid="tarjeta-detalle-dia-pago-input"
                  value={diaPago}
                  onChange={(e) => setDiaPago(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn dark" data-testid="tarjeta-detalle-guardar-button" onClick={guardarCortePago}>Guardar</button>
                <button className="btn" data-testid="tarjeta-detalle-cancelar-button" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="resumen-corte-pago"
              className="summary-row"
              style={{ padding: 0, marginBottom: 24 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="summary-box">
                <div className="summary-label">Corte</div>
                {tarjeta.dia_corte ? (
                  <>
                    <div className="summary-value mono">Día {tarjeta.dia_corte}</div>
                    <div className="mov-sub" data-testid="tarjeta-detalle-dias-corte">{formatDiasFaltantes(diasCorte)}</div>
                  </>
                ) : (
                  <div className="mov-sub" data-testid="tarjeta-detalle-dias-corte">No capturado</div>
                )}
              </div>
              <div className="summary-box credito">
                <div className="summary-label">Pago</div>
                {tarjeta.dia_pago ? (
                  <>
                    <div className="summary-value mono">Día {tarjeta.dia_pago}</div>
                    <div className="mov-sub" data-testid="tarjeta-detalle-dias-pago">{formatDiasFaltantes(diasPago)}</div>
                  </>
                ) : (
                  <div className="mov-sub" data-testid="tarjeta-detalle-dias-pago">No capturado</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="section-title" style={{ margin: "0 0 8px" }}>Compras a meses sin intereses</div>
        {cargando ? (
          <div className="mov-sub">Cargando...</div>
        ) : compras.length === 0 ? (
          <div className="mov-sub" data-testid="msi-empty-state">No tienes compras a meses activas en esta tarjeta.</div>
        ) : (
          <div className="msi-list">
            {compras.map((c) => (
              <motion.div
                className="cuenta-row-card"
                key={c.id}
                data-testid={`msi-row-${c.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="msi-row-top">
                  <div className="cuenta-row-name">{c.descripcion || "Compra a meses"}</div>
                  <div className="mono">{fmt(c.mensualidad)}/mes</div>
                </div>
                <div className="msi-row-bottom">
                  <span>Mes {c.meses_transcurridos + 1} de {c.meses_total}</span>
                  <span className="mono">{fmt(c.saldo_pendiente)} pendiente</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {!showAddMsi ? (
            <motion.button
              key="msi-add-link"
              className="action-btn"
              style={{ marginTop: 12, borderRadius: 16, padding: 16, background: "var(--paper-card)" }}
              data-testid="msi-add-link"
              onClick={() => setShowAddMsi(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="ico ahorro"><Plus size={17} /></span>Agregar compra a meses
            </motion.button>
          ) : (
            <motion.div
              key="msi-add-form"
              className="form-box"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <input
                placeholder="Descripción (ej. Laptop)"
                data-testid="msi-descripcion-input"
                value={descripcionMsi}
                onChange={(e) => setDescripcionMsi(e.target.value)}
              />
              <input
                placeholder="Monto total"
                inputMode="decimal"
                data-testid="msi-monto-input"
                value={montoMsi}
                onChange={(e) => setMontoMsi(e.target.value.replace(/[^0-9.]/g, ""))}
              />
              <input
                placeholder="Meses (ej. 12)"
                inputMode="numeric"
                data-testid="msi-meses-input"
                value={mesesMsi}
                onChange={(e) => setMesesMsi(e.target.value.replace(/[^0-9]/g, ""))}
              />

              {!creandoCategoriaMsi ? (
                <div className="select-wrapper">
                  <select
                    className="target-select"
                    data-testid="msi-categoria-select"
                    value={categoriaMsiId}
                    onChange={(e) => {
                      if (e.target.value === "__nueva__") {
                        setCreandoCategoriaMsi(true);
                        return;
                      }
                      setCategoriaMsiId(e.target.value);
                    }}
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                    <option value="__nueva__">+ Nueva categoría...</option>
                  </select>
                  <ChevronDown size={16} className="select-chevron" />
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input
                    style={{ marginBottom: 0, flex: 1 }}
                    placeholder="Nombre de la categoría"
                    data-testid="msi-categoria-nueva-input"
                    value={nuevaCategoriaMsi}
                    onChange={(e) => setNuevaCategoriaMsi(e.target.value)}
                  />
                  <button className="btn dark" data-testid="msi-categoria-crear-button" onClick={handleCrearCategoriaMsi}>
                    Agregar
                  </button>
                  <button
                    className="btn"
                    data-testid="msi-categoria-cancelar-button"
                    onClick={() => { setCreandoCategoriaMsi(false); setNuevaCategoriaMsi(""); }}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn dark" data-testid="msi-guardar-button" onClick={handleAddMsi}>Guardar</button>
                <button className="btn" data-testid="msi-cancelar-button" onClick={() => setShowAddMsi(false)}>Cancelar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
