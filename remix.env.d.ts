/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

type EnvironmentVars =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "COOKIE_SESSION_KEY_A"
  | "COOKIE_SESSION_KEY_B"
  | "SITE_URL";

type WindowWithEnvironment = Window &
  typeof globalThis & {
    env: Record<EnvironmentVars, "string">;
  };

interface IEnvironment extends Record<EnvironmentVars, string> {}
