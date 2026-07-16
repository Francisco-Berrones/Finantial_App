import { useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { COLORES_DISPONIBLES, ICONOS_DISPONIBLES, estiloCategoria } from "../../shared/categoriaIconos";

export default function CategoriaPickerModal({ categorias, crearCategoria, onSeleccionar, onClose }) {
  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState(ICONOS_DISPONIBLES[0].key);
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_DISPONIBLES[0]);

  const filtradas = busqueda.trim()
    ? categorias.filter((c) => c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : categorias;

  const handleCrear = async () => {
    if (!nuevaCategoria.trim()) return;
    const creada = await crearCategoria(nuevaCategoria, { icono: iconoSeleccionado, color: colorSeleccionado });
    if (creada) onSeleccionar(creada);
  };

  return (
    <div className="cat-picker-backdrop" data-testid="categoria-picker-backdrop" onClick={onClose}>
      <style>{`
        .cat-picker-backdrop {
          --bg: #F7F9FB; --surface-low: #F2F4F6; --surface-hi: #E6E8EA;
          --on-surface: #1A1C1E; --on-surface-variant: #44474E;
          --outline: #76777D; --outline-variant: #C6C6CD; --primary-container: #131B2E; --on-primary: #FFFFFF;
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); z-index: 60; display: flex; align-items: flex-end; justify-content: center;
        }
        .app-root[data-theme="dark"] .cat-picker-backdrop {
          --bg: #1B1F23; --surface-low: #15181B; --surface-hi: #262B30;
          --on-surface: #E2E2E6; --on-surface-variant: #C4C6D0;
          --outline: #8D9199; --outline-variant: #43474E; --primary-container: #2A3550; --on-primary: #131B2E;
        }
        .cat-picker-sheet { width: 100%; max-width: 480px; max-height: 90vh; background: var(--bg); border-radius: 32px 32px 0 0; box-shadow: 0 -8px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; font-family: Inter, sans-serif; }
        .cat-picker-handle { width: 48px; height: 6px; background: var(--surface-hi); border-radius: 9999px; margin: 12px auto 16px; }
        .cat-picker-head { display: flex; align-items: center; justify-content: space-between; padding: 0 20px 12px; }
        .cat-picker-titulo { font-size: 18px; font-weight: 600; color: var(--on-surface); }
        .cat-picker-close { width: 32px; height: 32px; border-radius: 9999px; background: var(--surface-hi); border: none; color: var(--on-surface-variant); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .cat-picker-buscar-wrap { padding: 0 20px 16px; }
        .cat-picker-buscar { position: relative; display: flex; align-items: center; }
        .cat-picker-buscar svg { position: absolute; left: 14px; color: var(--outline); pointer-events: none; }
        .cat-picker-buscar input { width: 100%; box-sizing: border-box; height: 48px; padding: 0 16px 0 42px; background: var(--surface-low); border: none; border-radius: 12px; font-family: Inter, sans-serif; font-size: 16px; color: var(--on-surface); outline: none; }
        .cat-picker-buscar input:focus { box-shadow: 0 0 0 2px var(--primary-container); }
        .cat-picker-grid-wrap { flex: 1; overflow-y: auto; padding: 0 20px calc(24px + env(safe-area-inset-bottom)); }
        .cat-picker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .cat-picker-item { display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; font-family: Inter, sans-serif; }
        .cat-picker-item:active { transform: scale(0.95); }
        .cat-picker-item-icono { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .cat-picker-item-nombre { font-size: 13px; font-weight: 500; color: var(--on-surface); text-align: center; }
        .cat-picker-item-nueva .cat-picker-item-icono { border: 2px dashed var(--outline-variant); color: var(--on-surface-variant); }
        .cat-picker-empty { color: var(--on-surface-variant); font-size: 14px; text-align: center; padding: 24px 0; grid-column: 1 / -1; }
        .cat-picker-crear-form { display: flex; flex-direction: column; gap: 20px; }
        .cat-picker-crear-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--outline); margin: 0 0 8px 4px; }
        .cat-picker-crear-form input[type="text"] { box-sizing: border-box; width: 100%; height: 48px; padding: 0 16px; background: var(--surface-low); border: 1px solid var(--outline-variant); border-radius: 12px; font-family: Inter, sans-serif; font-size: 16px; color: var(--on-surface); outline: none; }
        .cat-picker-crear-form input[type="text"]:focus { border-color: var(--primary-container); }
        .cat-picker-icono-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .cat-picker-icono-btn { aspect-ratio: 1; border-radius: 12px; background: var(--surface-low); border: 2px solid transparent; color: var(--on-surface-variant); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .cat-picker-icono-btn.selected { background: var(--sel-bg); color: var(--sel-color); border-color: var(--sel-color); }
        .cat-picker-color-row { display: flex; gap: 16px; }
        .cat-picker-color-btn { width: 32px; height: 32px; border-radius: 9999px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 0 0 2px transparent; }
        .cat-picker-color-btn.selected { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--sel-color); }
        .cat-picker-crear-form-btns { display: flex; gap: 12px; padding-top: 4px; }
        .cat-picker-crear-form-btns button { flex: 1; padding: 12px; border-radius: 9999px; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; }
        .cat-picker-crear-btn { background: var(--primary-container); color: var(--on-primary); border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .cat-picker-cancelar-btn { background: none; border: 1px solid var(--outline-variant); color: var(--on-surface); }
      `}</style>

      <div className="cat-picker-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cat-picker-handle" />
        <div className="cat-picker-head">
          <span className="cat-picker-titulo">{creando ? "Nueva categoría" : "Seleccionar Categoría"}</span>
          <button className="cat-picker-close" data-testid="categoria-picker-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {creando ? (
          <div className="cat-picker-grid-wrap">
            <div className="cat-picker-crear-form">
              <div>
                <label className="cat-picker-crear-label">Nombre de la categoría</label>
                <input
                  type="text"
                  placeholder="Ej. Gimnasio"
                  data-testid="nuevo-mov-categoria-nueva-input"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="cat-picker-crear-label">Selecciona un icono</label>
                <div className="cat-picker-icono-grid">
                  {ICONOS_DISPONIBLES.map(({ key, label, icon: Icon }) => {
                    const selected = iconoSeleccionado === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`cat-picker-icono-btn ${selected ? "selected" : ""}`}
                        style={selected ? { "--sel-bg": `${colorSeleccionado}26`, "--sel-color": colorSeleccionado } : undefined}
                        data-testid={`nuevo-mov-categoria-icono-${key}`}
                        title={label}
                        onClick={() => setIconoSeleccionado(key)}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="cat-picker-crear-label">Color</label>
                <div className="cat-picker-color-row">
                  {COLORES_DISPONIBLES.map((color) => {
                    const selected = colorSeleccionado === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`cat-picker-color-btn ${selected ? "selected" : ""}`}
                        style={{ background: color, "--sel-color": color }}
                        data-testid={`nuevo-mov-categoria-color-${color.replace("#", "")}`}
                        onClick={() => setColorSeleccionado(color)}
                      >
                        {selected && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="cat-picker-crear-form-btns">
                <button className="cat-picker-cancelar-btn" data-testid="nuevo-mov-categoria-cancelar-button" onClick={() => setCreando(false)}>
                  Cancelar
                </button>
                <button className="cat-picker-crear-btn" data-testid="nuevo-mov-categoria-crear-button" onClick={handleCrear}>
                  Guardar categoría
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="cat-picker-buscar-wrap">
              <div className="cat-picker-buscar">
                <Search size={18} />
                <input
                  placeholder="Buscar categoría..."
                  data-testid="categoria-picker-busqueda-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="cat-picker-grid-wrap">
              <div className="cat-picker-grid">
                {filtradas.length === 0 && (
                  <div className="cat-picker-empty">No hay categorías que coincidan con "{busqueda}".</div>
                )}
                {filtradas.map((c) => {
                  const { icon: Icon, bg, color } = estiloCategoria(c);
                  return (
                    <button
                      key={c.id}
                      className="cat-picker-item"
                      data-testid={`categoria-picker-item-${c.id}`}
                      onClick={() => onSeleccionar(c)}
                    >
                      <span className="cat-picker-item-icono" style={{ background: bg, color }}>
                        <Icon size={26} />
                      </span>
                      <span className="cat-picker-item-nombre">{c.nombre}</span>
                    </button>
                  );
                })}
                <button className="cat-picker-item cat-picker-item-nueva" data-testid="categoria-picker-crear-nueva" onClick={() => setCreando(true)}>
                  <span className="cat-picker-item-icono">
                    <Plus size={26} />
                  </span>
                  <span className="cat-picker-item-nombre">Crear Nueva</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
