import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import create, { getUser } from "~/services/session";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const { getSession, commitSession, destroySession } = create();

  const session = await getSession();

  if (body.get("event") === "SIGNED_OUT") {
    const cookie = await destroySession(session);

    return json(
      { user: null, accessToken: null },
      { headers: new Headers({ "Set-Cookie": cookie }) }
    );
  }

  session.set("accessToken", body.get("access_token"));
  session.set("refreshToken", body.get("refresh_token"));

  if (body.get("provider_token")) {
    session.set("providerToken", body.get("provider_token"));
  }

  const cookie = await commitSession(session);

  const user = await getUser(cookie);

  return json(user, { headers: new Headers({ "Set-Cookie": cookie }) });
};
