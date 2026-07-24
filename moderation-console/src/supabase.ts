import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const configurationError = !url || !publishableKey
  ? "Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY."
  : null;

export const supabase = createClient(
  url || "https://configuration-required.invalid",
  publishableKey || "configuration-required",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
