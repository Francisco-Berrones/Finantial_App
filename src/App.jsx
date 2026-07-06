import { useState, useEffect } from "react";
import { supabase } from "./shared/lib/supabaseClient";
import Login from "./shared/auth/Login";
import MainApp from "./MainApp";

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return null;
  if (!session) return <Login />;
  return <MainApp session={session} />;
}
