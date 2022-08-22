import { useEffect } from "react";
import { useUser } from "~/context/user";
import { fetchCallback } from "~/services/supabase";
import { useNavigate } from "@remix-run/react";

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

  return <div />;
}
