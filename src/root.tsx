import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import UserProvider from "~/context/user";
import supabaseClient from "~/services/supabase";
import { getUser } from "~/services/session";
import type { LoaderFunction } from "@remix-run/node";

import styles from "./styles/main.css";
import StatusProvider from "./context/status";
import PageLayout from "~/components/layout/Page";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Supabooked",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await getUser(request.headers.get("Cookie"));

  return json({
    user,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SITE_URL: process.env.SITE_URL,
    },
  });
};

export default function App() {
  const data = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <UserProvider user={data.user} supabaseClient={supabaseClient()}>
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
