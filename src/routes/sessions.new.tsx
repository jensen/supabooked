import { useEffect, useState } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, Outlet, useNavigate } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import { setHours, isSameDay } from "date-fns";
import Week from "~/components/calendar/Week";
import { getUser } from "~/services/session";

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = new URL(request.url).searchParams.get("invitation");
  const { accessToken } = await getUser(request);

  const client = supabaseClient(accessToken);

  const [calendar, invitation] = await Promise.all([
    client.rpc("get_calendar"),
    client
      .from("invitations")
      .update({ viewed: true })
      .match({ id })
      .select()
      .single(),
  ]);

  if (calendar.status === 401) {
    return redirect("/logout");
  }

  return json({
    availability: calendar.data,
    invitation: invitation.data || null,
  });
};

interface IAvailability {
  date: string;
  session: any;
}

interface ILoaderData {
  availability: IAvailability[];
  settings: { timezone: string; start_time: number; end_time: number };
  invitation: unknown | null;
}

const getDays = (availability: IAvailability[]) => {
  const days = [setHours(new Date(availability[0].date), 0)];

  for (const slot of availability) {
    const date = new Date(slot.date);

    if (isSameDay(new Date(slot.date), days[days.length - 1]) === false) {
      days.push(setHours(date, 0));
    }
  }

  return days;
};

export default function New() {
  const navigate = useNavigate();
  const data = useLoaderData<ILoaderData>();
  const [days, setDays] = useState<IDay[] | null>(null);

  useEffect(() => {
    const days = getDays(data.availability).map((day) => {
      return {
        day,
        hours: data.availability
          .filter((slot) => isSameDay(new Date(slot.date), day))
          .map((slot) => ({ ...slot, date: new Date(slot.date) })),
      };
    });

    setDays(days);
  }, [data]);

  if (days === null) return null;

  const handleSelectHour = (hour) => {
    navigate(`confirm/${hour.date.getTime()}`);
  };

  return (
    <>
      <div className="flex-grow flex justify-end">
        <Week availability={days} onSelectHour={handleSelectHour} />
      </div>
      <Outlet />
    </>
  );
}
