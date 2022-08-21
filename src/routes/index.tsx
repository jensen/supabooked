import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getUser } from "~/services/session";

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await getUser(request.headers.get("Cookie"));

  if (user) {
    return redirect("/schedule");
  }

  return json({});
};
export default function Index() {
  return <div>Splash</div>;
}
