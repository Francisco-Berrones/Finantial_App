import { useState, useCallback } from "react";
import { supabase } from "../../shared/lib/supabaseClient";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);

  const fetchCategorias = useCallback(async () => {
    const { data, error } = await supabase.from("categorias").select("*").order("nombre");
    if (error) console.error(error);
    setCategorias(data || []);
  }, []);

  const addCategoria = useCallback(async ({ nombre, userId, icono = null, color = null }) => {
    const { data, error } = await supabase
      .from("categorias")
      .insert({ nombre: nombre.trim(), user_id: userId, es_predefinida: false, icono, color })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return null;
    }
    return data;
  }, []);

  return { categorias, fetchCategorias, addCategoria };
}
