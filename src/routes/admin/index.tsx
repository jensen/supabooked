import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import supabaseClient from "~/services/supabase";
import { Eye, EnvelopeCircleCheck, Copy } from "~/components/shared/Icons";
import { css } from "~/utils/styles";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const email = body.get("email");
  const title = body.get("subject");
  const description = body.get("description");

  await supabaseClient().from("invitations").insert({
    email,
    title,
    description,
  });

  return redirect(`/admin`);
};

export const loader: LoaderFunction = async () => {
  const invitations = await supabaseClient().from("invitations").select();

  return json({
    invitations: invitations.data,
  });
};

export default function AdminIndex() {
  const data = useLoaderData();

  const [invitations, setInvitations] = useState<IInvitation[]>(
    data.invitations
  );

  useEffect(() => {
    const channel = supabaseClient()
      .channel("*")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invitations" },
        (payload: { new: IInvitation }) => {
          setInvitations((prev) =>
            prev.map((invitation) => {
              if (invitation.id === payload.new.id) {
                return { ...invitation, ...payload.new };
              }

              return invitation;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabaseClient().removeChannel(channel);
    };
  }, []);

  return (
    <section className="h-full grid place-content-center">
      <Form method="post" className="flex flex-col space-y-4">
        <label className="flex flex-col space-y-2">
          <span className="text-sm">Email</span>
          <input
            type="email"
            name="email"
            className="px-2 py-1 bg-transparent border border-border"
          />
        </label>
        <label className="flex flex-col space-y-2">
          <span className="text-sm">Subject</span>
          <input
            type="text"
            name="subject"
            className="px-2 py-1 bg-transparent border border-border"
          />
        </label>
        <label className="flex flex-col space-y-2">
          <span className="text-sm">Description</span>
          <textarea
            rows={3}
            name="description"
            className="px-2 py-1 bg-transparent border border-border resize-none"
          ></textarea>
        </label>
        <button className="border border-border px-8 py-2 hover:bg-red-400 hover:text-slate-300">
          Create Invitation
        </button>
      </Form>
      <div className="overflow-x-auto relative mt-6">
        <table className="w-full text-sm text-left text-text">
          <thead className="text-xs uppercase">
            <tr>
              <th scope="col" className="py-3 px-6">
                Email
              </th>
              <th scope="col" className="py-3 px-6">
                Details
              </th>
              <th scope="col" className="py-3 px-6">
                Viewed
              </th>
              <th scope="col" className="py-3 px-6">
                Emailed
              </th>
              <th scope="col" className="py-3 px-6">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr
                key={invitation.id}
                className="bg-background border-border border-b"
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium whitespace-nowrap"
                >
                  {invitation.email}
                </th>
                <td className="py-4 px-6">
                  <h2 className="text-lg">{invitation.title}</h2>
                  <h3 className="text-xs">{invitation.description}</h3>
                </td>
                <td
                  className={css("py-4 px-6", {
                    "opacity-50": invitation.viewed === false,
                    "text-yellow-500": invitation.user_id,
                  })}
                >
                  <Eye />
                </td>
                <td
                  className={css("py-4 px-6", {
                    "opacity-50": invitation.emailed === false,
                  })}
                >
                  <EnvelopeCircleCheck />
                </td>
                <td
                  className="py-4 px-6 opacity-50 hover:opacity-100 hover:cursor-pointer"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${
                        (window as WindowWithEnvironment).env.SITE_URL
                      }/sessions/new?invitation=${invitation.id}`
                    )
                  }
                >
                  <Copy />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
