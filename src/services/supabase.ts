import { createClient } from "@supabase/supabase-js";

let supabaseUrl: string;
let supabaseAnonKey: string;

try {
  supabaseUrl = process.env.SUPABASE_URL || "";
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
} catch {
  supabaseUrl = (window as WindowWithEnvironment).env.SUPABASE_URL;
  supabaseAnonKey = (window as WindowWithEnvironment).env.SUPABASE_ANON_KEY;
}

if (typeof supabaseUrl !== "string") {
  throw new Error("Most provide SUPABASE_URL");
}

if (typeof supabaseAnonKey !== "string") {
  throw new Error("Most provide SUPABASE_ANON_KEY");
}

export default function supabase(accessToken?: string) {
  if (accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
