import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate, useMatches, useParams, Form } from "@remix-run/react";
import { format, addHours } from "date-fns";
import Button from "~/components/shared/Button";
import Modal from "~/components/shared/Modal";
import { getUser } from "~/services/session";
import supabaseClient from "~/services/supabase";

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();

  const title = body.get("subject") as string;
  const description = body.get("description") as string;
  const from = body.get("from") as string;
  const to = body.get("to") as string;

  const { user, accessToken } = await getUser(request);

  if (!user) {
    throw new Error("Must be logged in");
  }

  await supabaseClient(accessToken).from("sessions").insert({
    title,
    description,
    scheduled_from: from,
    scheduled_to: to,
    user_id: user.id,
  });

  return redirect(`/schedule`);
};

export default function Confirm() {
  const params = useParams();
  const data = useMatches().find((m) => m.pathname === "/sessions/new")?.data;

  const navigate = useNavigate();

  const handleClose = () => navigate("..");

  const from = new Date(Number(params.date));
  const to = addHours(new Date(Number(params.date)), 1);

  return (
    <Modal title="Confirm Session" onClose={handleClose}>
      <Form method="post">
        <div className="flex flex-col space-y-4">
          <label className="flex flex-col space-y-2">
            <span className="text-sm">Subject</span>
            <input
              type="text"
              name="subject"
              className="px-2 py-1 bg-transparent border border-border"
              defaultValue={data.invitation?.title ?? ""}
            />
          </label>
          <label className="flex flex-col space-y-2">
            <span className="text-sm">Description</span>
            <textarea
              rows={5}
              name="description"
              className="px-2 py-1 bg-transparent border border-border resize-none"
              defaultValue={data.invitation?.description ?? ""}
            ></textarea>
          </label>
          <label className="flex flex-col space-y-2">
            <div className="flex flex-col">
              <span className="text-md text-gray-400">
                {format(from, "MMMM do, yyyy")}
              </span>
              <span className="text-lg font-bold text-gray-300">
                {format(from, "ha - ")}
                {format(to, "ha")}
              </span>
            </div>
            <input type="hidden" name="from" value={from.toISOString()} />
            <input type="hidden" name="to" value={to.toISOString()} />
          </label>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button>Confirm</Button>
        </div>
      </Form>
    </Modal>
  );
}
