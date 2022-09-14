import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getUser } from "~/services/session";
import DiscordLogin from "~/components/auth/DiscordLogin";
import supabaseClient from "~/services/supabase";

export const loader = async ({ request }: LoaderArgs) => {
  const { accessToken } = await getUser(request);

  if (accessToken) {
    const profile = await supabaseClient(accessToken)
      .from("profiles_private")
      .select()
      .single();

    if (profile.data) {
      return redirect(profile.data.admin ? "/admin" : "/schedule");
    }
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
      </section>
    </>
  );
}
