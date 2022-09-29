import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import create, { getExpiry } from "~/services/session";

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const auth = (body.get("credentials") as string) || "";

  const searchParams = new URLSearchParams(auth);

  if (searchParams.get("access_token") === null) {
    return redirect("/");
  }

  const { getSession, commitSession } = create();

  const session = await getSession();

  session.set("accessToken", searchParams.get("access_token"));
  session.set("refreshToken", searchParams.get("refresh_token"));

  if (searchParams.get("provider_token")) {
    session.set("providerToken", searchParams.get("provider_token"));
  }

  const cookie = await commitSession(session, {
    expires: getExpiry(),
  });

  return redirect("/", { headers: new Headers({ "Set-Cookie": cookie }) });
};
