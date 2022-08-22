import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import create from "~/services/session";
import supabaseClient from "~/services/supabase";

export const loader: LoaderFunction = async ({ request }) => {
  const { getSession, commitSession } = create();
  const session = await getSession(request.headers.get("Cookie"));

  const refreshToken = session.get("refreshToken") || null;

  if (refreshToken) {
    const client = await supabaseClient(refreshToken);
    const {
      data: { session: refreshed },
      error,
    } = await client.auth.getSession();

    if (refreshed) {
      session.set("accessToken", refreshed.access_token);
      session.set("refreshToken", refreshed.refresh_token);
    }

    const cookie = await commitSession(session);

    const profile = await client
      .from("profiles_private")
      .select()
      .match({ id: refreshed?.user.id })
      .single();

    return redirect(profile.data.admin ? "/admin" : "/schedule", {
      headers: new Headers({ "Set-Cookie": cookie }),
    });
  }

  return json({});
};
export default function Index() {
  return <div>Splash</div>;
}
