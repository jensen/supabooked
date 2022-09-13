import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import create, { getUser, getExpiry } from "~/services/session";

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

  if (
    body.get("event") === "SIGNED_IN" ||
    body.get("event") === "TOKEN_REFRESHED"
  ) {
    session.set("accessToken", body.get("access_token"));
    session.set("refreshToken", body.get("refresh_token"));

    if (body.get("provider_token")) {
      session.set("providerToken", body.get("provider_token"));
    }

    const cookie = await commitSession(session, {
      expires: getExpiry(),
    });

    return json({}, { headers: new Headers({ "Set-Cookie": cookie }) });
  }

  return json(
    { user: null, accessToken: null },
    {
      headers: new Headers({
        "Set-Cookie": request.headers.get("Cookie") || "",
      }),
    }
  );
};
