import type { User, SupabaseClient } from "@supabase/supabase-js";
import { useContext, createContext, useEffect, useState } from "react";

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

  useEffect(() => {
    const { subscription } = client.auth.onAuthStateChange(
      async (event, session) => {
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

        const auth = await fetchCallback({ event, ...body });

        setAuth(auth);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, [client.auth]);

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
          supabaseClient.auth.signInWithOAuth({ provider: "discord" }),
        logout: () => supabaseClient.auth.signOut(),
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
