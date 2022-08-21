import type { User, SupabaseClient } from "@supabase/supabase-js";
import { useContext, createContext, useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

interface IUserContext {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<IUserContext>({
  isAuthenticated: false,
  user: null,
  login: () => null,
  logout: () => null,
});

const fetchCallback = async (body: { [key: string]: string }) => {
  const data = new FormData();

  for (const key in body) {
    data.append(key, body[key]);
  }

  const response = await fetch("/api/auth/callback", {
    method: "post",
    body: data,
  });

  return response.json();
};

const useAuthCallback = (client: SupabaseClient) => {
  const [auth, setAuth] = useState({ user: null, accessToken: null });
  const navigate = useNavigate();

  useEffect(() => {
    const { subscription } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
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

          if (auth.user === null) {
            navigate(response.user ? "/sessions/new" : "/");
          }
        }
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, [auth.user, client.auth, navigate]);

  return auth;
};

interface Props {
  supabaseClient: SupabaseClient;
  user: User | null;
}

export default function UserProvider(props: React.PropsWithChildren<Props>) {
  const { supabaseClient, user: authedUser } = props;

  const auth = useAuthCallback(supabaseClient);

  const user = auth.user || authedUser;

  return (
    <UserContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login: () =>
          supabaseClient.auth.signInWithOAuth({
            provider: "discord",
            options: {
              redirectTo: `${
                (window as WindowWithEnvironment).env.SITE_URL
              }/authenticated`,
            },
          }),
        logout: () => supabaseClient.auth.signOut(),
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
