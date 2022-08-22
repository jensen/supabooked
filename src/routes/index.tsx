import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import create from "~/services/session";
import DiscordLogin from "~/components/auth/DiscordLogin";
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
  return (
    <>
      <section className="flex justify-between items-center space-x-8">
        <div className="">
          <h2 className="font-semibold text-xl">
            Brand new, yet to win awards.
          </h2>
          <p className="font-bold text-4xl my-4 leading-8">
            The world needs another scheduling tool.
          </p>
          <p className="font-regular text-lg mb-10 leading-6">
            This isn't very different from the other tools that do the same
            thing as this one.
          </p>
          <DiscordLogin />
        </div>
        <img
          className="border-4 border-border rounded-full shadow-lg"
          src="/images/hero.png"
          alt="Splash screen for scheduler"
        />
      </section>
    </>
  );
}
