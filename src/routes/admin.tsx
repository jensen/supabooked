import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { Tab } from "@headlessui/react";
import { css } from "~/utils/styles";
import supabaseClient from "~/services/supabase";
import create from "~/services/session";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const { getSession, commitSession } = create();
  const session = await getSession(request.headers.get("Cookie"));

  const refreshToken = session.get("refreshToken") || null;

  if (refreshToken) {
    const client = await supabaseClient(refreshToken);
    const {
      data: { session: refreshed },
      error,
    } = await client.auth.getSession();

    if (refreshed) {
      session.set("accessToken", refreshed.access_token);
      session.set("refreshToken", refreshed.refresh_token);
    }

    const cookie = await commitSession(session);

    const profile = await (await supabaseClient(refreshToken))
      .from("profiles_private")
      .select()
      .single();

    if (profile.data.admin === false) {
      return redirect("/schedule", {
        headers: new Headers({ "Set-Cookie": cookie }),
      });
    }

    if (url.pathname === "/admin") {
      return redirect("/admin/invitations", {
        headers: new Headers({ "Set-Cookie": cookie }),
      });
    }

    return json(
      {},
      {
        headers: new Headers({ "Set-Cookie": cookie }),
      }
    );
  }

  return json({});
};

const pages = ["invitations", "sessions"];
const last = (list: string[]) => list[list.length - 1];

export default function AdminIndex() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (index: number) => {
    navigate(pages[index]);
  };

  return (
    <>
      <Tab.Group
        selectedIndex={pages.indexOf(last(location.pathname.split("/")))}
        onChange={handleChange}
      >
        <Tab.List className="mb-8 flex ">
          {pages.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                css(
                  "w-full py-2 text-sm text-gray-400",
                  "border-b-2 focus:outline-none",
                  selected
                    ? " border-border text-text"
                    : "border-transparent hover:bg-available hover:border-border"
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
      <Outlet />
    </>
  );
}
