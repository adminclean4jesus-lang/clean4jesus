import "react-native-url-polyfill/auto";

import { createClient, processLock, type SupabaseClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { authStorage } from "@/lib/supabaseStorage";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith("https://") && supabasePublishableKey.length > 20,
);

let client: SupabaseClient<Database> | null = null;
let appStateSubscriptionCreated = false;

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase aún no está conectado. Agrega la URL y la clave pública del proyecto.");
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new SupabaseConfigurationError();
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        lock: processLock,
        persistSession: true,
      },
    });
  }

  if (Platform.OS !== "web" && !appStateSubscriptionCreated) {
    appStateSubscriptionCreated = true;
    AppState.addEventListener("change", (state) => {
      if (!client) {
        return;
      }

      if (state === "active") {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });
  }

  return client;
}

export function getSupabaseFunctionUrl(functionName: string) {
  if (!isSupabaseConfigured || !/^[a-z0-9-]+$/.test(functionName)) {
    throw new SupabaseConfigurationError();
  }
  return `${supabaseUrl}/functions/v1/${functionName}`;
}
