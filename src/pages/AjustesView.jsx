import { ChevronLeft, LogOut } from "lucide-react";
import { supabase } from "../shared/lib/supabaseClient";

export default function AjustesView({ onBack }) {
  return (
    <div>
      <div className="nuevo-mov-header">
        <button className="nuevo-mov-back" data-testid="ajustes-back-button" onClick={onBack}>
          <ChevronLeft size={22} />
        </button>
        <span className="nuevo-mov-title">Ajustes</span>
      </div>

      <div className="nuevo-mov-body">
        <button
          className="btn"
          data-testid="ajustes-logout-button"
          onClick={() => supabase.auth.signOut()}
          style={{ backgroundColor: "#A8412B", color: "#FFFFFF", borderColor: "#A8412B", borderWidth: "1px", borderStyle: "solid", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
