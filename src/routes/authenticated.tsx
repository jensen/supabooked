import { useEffect } from "react";
import { useUser } from "~/context/user";
import { fetchCallback } from "~/services/supabase";
import { useNavigate } from "@remix-run/react";
import { CircleNotchAnimated } from "~/components/shared/Icons";

export default function Authenticated() {
  const { user, supabaseClient, setAuth } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (supabaseClient === null) return;

    const { subscription } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          const body: {
            access_token?: string;
            refresh_token?: string;
            provider_token?: string;
          } = session
            ? {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                provider_token: session.provider_token || "",
              }
            : {};

          const response = await fetchCallback({ event, ...body });

          setAuth(response);

          navigate("/");
        }
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, [user, supabaseClient, navigate, setAuth]);

  return (
    <section className="h-full grid place-content-center">
      <div className="border border-dashed border-border px-8 py-4 flex space-x-4 items-center">
        <CircleNotchAnimated />
        <span className="font-light text-2xl">Authenticating</span>
      </div>
    </section>
  );
}
