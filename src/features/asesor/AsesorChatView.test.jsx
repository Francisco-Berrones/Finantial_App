import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AsesorChatView from "./AsesorChatView";
import { supabase } from "../../shared/lib/supabaseClient";

// Minimal fake postgrest builder: chainable methods return itself, terminal
// methods (.single() / awaiting the builder directly) resolve the next queued
// result for that table. Calls beyond what a test queues get a harmless default,
// so we only need to script the results that actually affect what's rendered.
vi.mock("../../shared/lib/supabaseClient", () => {
  const queues = {};
  function from(table) {
    const queue = queues[table] || (queues[table] = []);
    const result = queue.length > 0 ? queue.shift() : { data: null, error: null };
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      is: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      single: () => Promise.resolve(result),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  }
  return {
    supabase: { from, __queues: queues, functions: { invoke: vi.fn() } },
  };
});

const session = { user: { id: "user-1" } };

describe("AsesorChatView", () => {
  beforeEach(() => {
    supabase.functions.invoke.mockReset();
    supabase.__queues.conversaciones = [];
    supabase.__queues.chat_mensajes = [];
  });

  it("creates a conversación automatically when there are none, and shows the empty state", async () => {
    supabase.__queues.conversaciones = [
      { data: [], error: null }, // fetchConversaciones (initial, empty)
      { data: { id: "conv-1", titulo: null, fecha_actualizacion: new Date().toISOString() }, error: null }, // crearConversacion
      { data: [{ id: "conv-1", titulo: null, fecha_actualizacion: new Date().toISOString() }], error: null }, // fetchConversaciones (after create)
    ];
    supabase.__queues.chat_mensajes = [{ data: [], error: null }];

    render(<AsesorChatView session={session} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Pregúntame sobre tus tarjetas y cuentas/)).toBeInTheDocument();
    });
  });

  it("loads the most recent conversación and its mensajes on mount", async () => {
    supabase.__queues.conversaciones = [
      { data: [{ id: "conv-1", titulo: "Gasto de julio", fecha_actualizacion: new Date().toISOString() }], error: null },
    ];
    supabase.__queues.chat_mensajes = [
      {
        data: [
          { id: "m1", rol: "usuario", contenido: "¿En qué gasté más?" },
          { id: "m2", rol: "asesor", contenido: "En comida." },
        ],
        error: null,
      },
    ];

    render(<AsesorChatView session={session} onBack={vi.fn()} />);

    await screen.findByText("¿En qué gasté más?");
    expect(screen.getByText("En comida.")).toBeInTheDocument();
    expect(screen.getByText("Gasto de julio")).toBeInTheDocument();
  });

  it("sends a question with prior turns as historial and shows the response", async () => {
    supabase.__queues.conversaciones = [
      { data: [{ id: "conv-1", titulo: "Gasto de julio", fecha_actualizacion: new Date().toISOString() }], error: null },
    ];
    supabase.__queues.chat_mensajes = [
      { data: [{ id: "m1", rol: "usuario", contenido: "¿En qué gasté más?" }, { id: "m2", rol: "asesor", contenido: "En comida." }], error: null },
    ];
    supabase.functions.invoke.mockResolvedValue({ data: { respuesta: "Puedes recortar en comida." }, error: null });

    render(<AsesorChatView session={session} onBack={vi.fn()} />);
    await screen.findByText("En comida.");

    fireEvent.change(screen.getByTestId("asesor-input"), { target: { value: "¿Cómo le bajo?" } });
    fireEvent.click(screen.getByTestId("asesor-send-button"));

    await waitFor(() => expect(supabase.functions.invoke).toHaveBeenCalled());
    expect(supabase.functions.invoke).toHaveBeenCalledWith("asesor-chat", {
      body: {
        pregunta: "¿Cómo le bajo?",
        historial: [
          { rol: "usuario", contenido: "¿En qué gasté más?" },
          { rol: "asesor", contenido: "En comida." },
        ],
      },
    });

    await screen.findByText("Puedes recortar en comida.");
  });

  it("shows a fallback message when the function call fails", async () => {
    supabase.__queues.conversaciones = [{ data: [{ id: "conv-1", titulo: null, fecha_actualizacion: new Date().toISOString() }], error: null }];
    supabase.__queues.chat_mensajes = [{ data: [], error: null }];
    supabase.functions.invoke.mockResolvedValue({ data: null, error: new Error("network error") });

    render(<AsesorChatView session={session} onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByTestId("asesor-input")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("asesor-input"), { target: { value: "Hola" } });
    fireEvent.click(screen.getByTestId("asesor-send-button"));

    await screen.findByText(/No pude conectar con el asesor/);
  });

  it("opens the conversaciones list and switches conversations", async () => {
    const fechaVieja = new Date(Date.now() - 86400000).toISOString();
    supabase.__queues.conversaciones = [
      {
        data: [
          { id: "conv-1", titulo: "Reciente", fecha_actualizacion: new Date().toISOString() },
          { id: "conv-2", titulo: "Vieja", fecha_actualizacion: fechaVieja },
        ],
        error: null,
      },
    ];
    supabase.__queues.chat_mensajes = [
      { data: [{ id: "m1", rol: "usuario", contenido: "Pregunta reciente" }], error: null },
      { data: [{ id: "m2", rol: "usuario", contenido: "Pregunta vieja" }], error: null },
    ];

    render(<AsesorChatView session={session} onBack={vi.fn()} />);
    await screen.findByText("Pregunta reciente");

    fireEvent.click(screen.getByTestId("asesor-history-button"));
    expect(screen.getByTestId("conversaciones-item-conv-2")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("conversaciones-item-conv-2"));
    await screen.findByText("Pregunta vieja");
  });

  it("calls onBack when the back button is clicked", async () => {
    supabase.__queues.conversaciones = [{ data: [{ id: "conv-1", titulo: null, fecha_actualizacion: new Date().toISOString() }], error: null }];
    supabase.__queues.chat_mensajes = [{ data: [], error: null }];
    const onBack = vi.fn();

    render(<AsesorChatView session={session} onBack={onBack} />);
    await waitFor(() => expect(screen.getByTestId("asesor-input")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("asesor-back-button"));
    expect(onBack).toHaveBeenCalled();
  });
});
