import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AsesorChatView from "./AsesorChatView";
import { supabase } from "../../shared/lib/supabaseClient";

vi.mock("../../shared/lib/supabaseClient", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

describe("AsesorChatView", () => {
  beforeEach(() => {
    supabase.functions.invoke.mockReset();
  });

  it("shows the empty state before any message is sent", () => {
    render(<AsesorChatView onBack={vi.fn()} />);
    expect(screen.getByText(/Pregúntame sobre tus tarjetas y cuentas/)).toBeInTheDocument();
  });

  it("sends the question to the asesor-chat function and shows the response", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: { respuesta: "Te conviene la tarjeta Oro." }, error: null });
    render(<AsesorChatView onBack={vi.fn()} />);

    fireEvent.change(screen.getByTestId("asesor-input"), { target: { value: "¿Con cuál tarjeta pago $2,500?" } });
    fireEvent.click(screen.getByTestId("asesor-send-button"));

    expect(supabase.functions.invoke).toHaveBeenCalledWith("asesor-chat", {
      body: { pregunta: "¿Con cuál tarjeta pago $2,500?" },
    });
    expect(screen.getByTestId("asesor-msg-usuario")).toHaveTextContent("¿Con cuál tarjeta pago $2,500?");

    await waitFor(() => {
      expect(screen.getByTestId("asesor-msg-asesor")).toHaveTextContent("Te conviene la tarjeta Oro.");
    });
  });

  it("shows a fallback message when the function call fails", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: null, error: new Error("network error") });
    render(<AsesorChatView onBack={vi.fn()} />);

    fireEvent.change(screen.getByTestId("asesor-input"), { target: { value: "Hola" } });
    fireEvent.click(screen.getByTestId("asesor-send-button"));

    await waitFor(() => {
      expect(screen.getByTestId("asesor-msg-asesor")).toHaveTextContent("No pude conectar con el asesor");
    });
  });

  it("does not send an empty question", () => {
    render(<AsesorChatView onBack={vi.fn()} />);
    expect(screen.getByTestId("asesor-send-button")).toBeDisabled();
    fireEvent.click(screen.getByTestId("asesor-send-button"));
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("calls onBack when the back button is clicked", () => {
    const onBack = vi.fn();
    render(<AsesorChatView onBack={onBack} />);
    fireEvent.click(screen.getByTestId("asesor-back-button"));
    expect(onBack).toHaveBeenCalled();
  });
});
