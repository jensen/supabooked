import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useRef, useEffect, useState } from "react";
import supabaseClient from "~/services/supabase";
import {
  Eye,
  EnvelopeCircleCheck,
  Copy,
  CircleLightning,
  CircleNotchAnimated,
} from "~/components/shared/Icons";
import Button from "~/components/shared/Button";
import { css } from "~/utils/styles";
import { useStatus } from "~/context/status";
import { useUser } from "~/context/user";
import { getUser } from "~/services/session";

export const action: ActionFunction = async ({ request }) => {
  const { accessToken } = await getUser(request);
  const body = await request.formData();

  const email = body.get("email");
  const title = body.get("subject");
  const description = body.get("description");

  await supabaseClient(accessToken).from("invitations").insert({
    email,
    title,
    description,
  });

  return redirect(`/admin/invitations`);
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const { accessToken } = await getUser(request);

  const invitations = await supabaseClient(accessToken)
    .from("invitations")
    .select();

  return json({
    invitations: invitations.data,
  });
};

export default function AdminInvitations() {
  const data = useLoaderData();
  const transition = useTransition();

  const invitationFormRef = useRef<HTMLFormElement>(null);
  const isCreating = transition.state === "submitting";

  const { supabaseClient } = useUser();

  const { onlineUsers } = useStatus();

  const [invitations, setInvitations] = useState<IInvitation[]>(
    data.invitations
  );

  useEffect(() => {
    if (!isCreating && invitationFormRef.current) {
      invitationFormRef.current.reset();
    }
  }, [isCreating]);

  useEffect(() => {
    setInvitations(data.invitations);
  }, [data.invitations]);

  useEffect(() => {
    const channel = supabaseClient
      .channel("db-changes")
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
      channel.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <>
      <Form
        ref={invitationFormRef}
        method="post"
        className="flex flex-col space-y-4 border-b border-border pb-8"
      >
        <div className="flex space-x-8">
          <div className="flex flex-col space-y-4">
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
          </div>
          <label className="flex flex-col space-y-2 flex-grow">
            <span className="text-sm">Description</span>
            <textarea
              name="description"
              className="h-full px-2 py-1 bg-transparent border border-border resize-none"
            ></textarea>
          </label>
        </div>

        <Button disabled={isCreating}>
          {isCreating && <CircleNotchAnimated />}
          <span>{isCreating ? "Creating..." : "Create Invitation"}</span>
        </Button>
      </Form>
      <div className="overflow-x-auto relative mt-4">
        <table className="w-full text-sm text-left text-text">
          <thead className="text-xs uppercase">
            <tr>
              <th scope="col" className="py-3 px-6">
                &nbsp;
              </th>
              <th scope="col" className="py-3 px-6">
                Email
              </th>
              <th scope="col" className="py-3 px-6">
                Details
              </th>
              <th scope="col" className="py-3 px-6">
                &nbsp;
              </th>
              <th scope="col" className="py-3 px-6">
                &nbsp;
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
                <td
                  className={css("py-4 px-6", {
                    "text-green-500": onlineUsers.includes(invitation.user_id),
                    "text-gray-400 opacity-50":
                      onlineUsers.includes(invitation.user_id) === false,
                  })}
                >
                  <CircleLightning />
                </td>
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
    </>
  );
}
