import type { User, SupabaseClient } from "@supabase/supabase-js";
import React, { useContext, createContext, useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import supabase from "~/services/supabase";

interface IUserContext {
  isAuthenticated: boolean;
  user: User | null;
  supabaseClient: SupabaseClient | null;
  setAuth: React.Dispatch<React.SetStateAction<any>>;
  login: () => void;
  logout: () => void;
}

const UserContext = createContext<IUserContext>({
  isAuthenticated: false,
  user: null,
  supabaseClient: null,
  setAuth: () => null,
  login: () => null,
  logout: () => null,
});

interface Props {
  user: User | null;
  refreshToken: string;
}

export default function UserProvider(props: React.PropsWithChildren<Props>) {
  const { user: authedUser, refreshToken } = props;
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(
    null
  );
  const [auth, setAuth] = useState({ user: null, accessToken: null });

  const navigate = useNavigate();

  useEffect(() => {
    supabase(refreshToken).then((client) => setSupabaseClient(client));
  }, [refreshToken]);

  const user = auth.user || authedUser;

  if (!supabaseClient) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        setAuth,
        supabaseClient,
        login: () =>
          supabaseClient.auth.signInWithOAuth({
            provider: "discord",
            options: {
              redirectTo: `${
                (window as WindowWithEnvironment).env.SITE_URL
              }/authenticated`,
            },
          }),
        logout: () => {
          setAuth({ user: null, accessToken: null });
          navigate("/api/auth/logout");
        },
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
