import { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { getUser } from "~/services/session";
import supabaseClient from "~/services/supabase";
import { format } from "date-fns";
import { useEffect } from "react";
import Button from "~/components/shared/Button";
import { Video } from "~/components/shared/Icons";

export const loader: LoaderFunction = async ({ request }) => {
  const { user, accessToken } = await getUser(request);

  if (!user) {
    return redirect("/");
  }

  const sessions = await supabaseClient(accessToken)
    .from("sessions")
    .select()
    .order("scheduled_from")
    .match({ user_id: user.id });

  return json({
    sessions: sessions.data,
  });
};

interface IDateSession
  extends Omit<ISession, "scheduled_from" | "scheduled_to"> {
  scheduled_from: Date;
  scheduled_to: Date;
}

interface SessionProps {
  session: IDateSession;
}

const Session = (props: SessionProps) => {
  return (
    <li className="flex justify-between space-x-4 border-b border-border py-4 px-2">
      <div className="flex flex-col flex-grow">
        <span className="text-lg">{props.session.title}</span>
        <span className="text-xs">{props.session.description}</span>
      </div>
      <div className="self-stretch flex flex-col items-end space-x-2">
        <span className="text-xl font-bold">
          {format(new Date(props.session.scheduled_from), "MMM do")}
        </span>
        <span className="text-sm">
          {format(props.session.scheduled_from, "HH:mm")} -{" "}
          {format(props.session.scheduled_to, "HH:mm")}
        </span>
      </div>
      <div className="w-12 grid place-content-center">
        {props.session.video && (
          <Link to={`/schedule/video/${props.session.id}`}>
            <Video />
          </Link>
        )}
      </div>
    </li>
  );
};

export default function UserSchedule() {
  const data = useLoaderData<{ sessions: ISession[] }>();

  const [sessions, setSessions] = useState<IDateSession[] | null>(null);

  useEffect(() => {
    setSessions(
      data.sessions.map((session) => ({
        ...session,
        scheduled_from: new Date(session.scheduled_from),
        scheduled_to: new Date(session.scheduled_to),
      }))
    );
  }, [data.sessions]);

  if (sessions === null) return null;

  return (
    <>
      <Outlet />
      <ul className="w-full mb-4">
        {sessions.map((session) => (
          <Session key={session.id} session={session} />
        ))}
      </ul>
      <Link to="/sessions/new">
        <Button>New Session</Button>
      </Link>
    </>
  );
}
