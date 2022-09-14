import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import UserProvider from "~/context/user";
import { getUser } from "~/services/session";
import type { LoaderFunction } from "@remix-run/node";

import styles from "./styles/main.css";
import StatusProvider from "./context/status";
import PageLayout from "~/components/layout/Page";
import { useEffect } from "react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Supabooked",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, accessToken } = await getUser(request);

  return json({
    user,
    accessToken,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SITE_URL: process.env.SITE_URL,
    },
  });
};

const useRedirectOnLogin = () => {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);

      if (params.has("to")) {
        navigate(pathname);
      }
    }
  }, [pathname, search, navigate]);
};

export default function App() {
  const data = useLoaderData();

  useRedirectOnLogin();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <UserProvider user={data.user} accessToken={data.accessToken}>
          <StatusProvider>
            <PageLayout />
          </StatusProvider>
        </UserProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(data.env)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
