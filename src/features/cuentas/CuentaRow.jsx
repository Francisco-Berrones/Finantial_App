import { fmt } from "../../shared/format";

export default function CuentaRow({ cuenta }) {
  return (
    <div className="cuenta-row-card" data-testid={`cuenta-row-${cuenta.id}`}>
      <div className="cuenta-row-name">{cuenta.nombre}</div>
      <div className="cuenta-row-saldo mono">{fmt(cuenta.saldo)}</div>
    </div>
  );
}
