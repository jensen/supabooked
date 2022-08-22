import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import create from "~/services/session";

export const loader: LoaderFunction = async () => {
  const { getSession, destroySession } = create();

  const session = await getSession();

  const cookie = await destroySession(session);

  return redirect("/", { headers: new Headers({ "Set-Cookie": cookie }) });
};
