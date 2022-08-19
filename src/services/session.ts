import { createCookieSessionStorage } from "@remix-run/node";

import { jwtDecoder } from "@supabase/auth-helpers-shared";

const cookieSessionKeyA = process.env.COOKIE_SESSION_KEY_A || "";
const cookieSessionKeyB = process.env.COOKIE_SESSION_KEY_B || "";

if (cookieSessionKeyA && typeof cookieSessionKeyA !== "string") {
  throw new Error("Most provide COOKIE_SESSION_KEY_A");
}

if (cookieSessionKeyB && typeof cookieSessionKeyB !== "string") {
  throw new Error("Most provide COOKIE_SESSION_KEY_B");
}

const LENGTH = 604_800;

export const getUser = async (cookie: string | null) => {
  const { getSession } = create();

  if (!cookie) {
    return { user: null, accessToken: null };
  }

  const session = await getSession(cookie);

  const access_token = session.get("accessToken");

  if (!access_token) {
    return { user: null, accessToken: null };
  }

  const encodedUser = jwtDecoder(access_token);

  const user = {
    id: encodedUser.sub,
    aud: null,
    role: null,
    email: null,
    email_confirmed_at: null,
    phone: null,
    confirmed_at: null,
    last_sign_in_at: null,
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: null,
    updated_at: null,
    ...encodedUser,
  };

  return { user, accessToken: access_token };
};

export default function create() {
  const storage = createCookieSessionStorage({
    cookie: {
      name: "auth",
      expires: new Date(Date.now() + LENGTH * 1000),
      httpOnly: true,
      maxAge: LENGTH,
      path: "/",
      sameSite: "lax",
      secrets: [cookieSessionKeyA, cookieSessionKeyB],
      secure: true,
    },
  });

  return storage;
}
