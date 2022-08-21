import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { Tab } from "@headlessui/react";
import { css } from "~/utils/styles";
import { json, redirect } from "@remix-run/node";

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);

  if (url.pathname === "/admin") {
    return redirect("/admin/invitations");
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
