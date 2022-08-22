import { createClient } from "@supabase/supabase-js";

let supabaseUrl: string;
let supabaseAnonKey: string;
let isBrowser: boolean;

try {
  supabaseUrl = process.env.SUPABASE_URL || "";
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  isBrowser = false;
} catch {
  supabaseUrl = (window as WindowWithEnvironment).env.SUPABASE_URL;
  supabaseAnonKey = (window as WindowWithEnvironment).env.SUPABASE_ANON_KEY;
  isBrowser = true;
}

if (typeof supabaseUrl !== "string") {
  throw new Error("Most provide SUPABASE_URL");
}

if (typeof supabaseAnonKey !== "string") {
  throw new Error("Most provide SUPABASE_ANON_KEY");
}

export const fetchCallback = async (body: { [key: string]: string }) => {
  const data = new FormData();

  for (const key in body) {
    data.append(key, body[key]);
  }

  const response = await fetch("/api/auth/callback", {
    method: "post",
    body: data,
  });

  return response.json();
};

export default async function supabase(refreshToken?: string) {
  if (refreshToken) {
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    const result = await authedClient.auth.setSession(refreshToken);

    if (isBrowser && result.data.session) {
      await fetchCallback({
        event: "TOKEN_REFRESHED",
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
      });
    }

    return authedClient;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
