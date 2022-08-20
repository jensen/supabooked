import { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import { getHours, isSameDay, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import Week from "~/components/calendar/Week";
import { useEffect } from "react";

export const loader: LoaderFunction = async () => {
  const [calendar, settings] = await Promise.all([
    supabaseClient().rpc("get_calendar"),
    supabaseClient().from("settings").select().single(),
  ]);

  return json({
    availability: calendar.data,
    settings: settings.data,
  });
};

interface ILoaderData {
  availability: {
    date: string;
    session: any;
  }[];
  settings: { timezone: string; start_time: number; end_time: number };
}

export default function New() {
  const data = useLoaderData<ILoaderData>();
  const [days, setDays] = useState<IDay[] | null>(null);

  useEffect(() => {
    const slots = data.availability
      .map((slot) => ({ date: new Date(slot.date), session: slot.session }))
      .filter(({ date }) => {
        return (
          getHours(utcToZonedTime(date, data.settings.timezone)) >=
            data.settings.start_time &&
          getHours(utcToZonedTime(date, data.settings.timezone)) <
            data.settings.end_time
        );
      });

    const days = Object.values(
      slots.reduce<{ [key: string]: IHour[] }>((days, slot, index, list) => {
        const key = format(slot.date, "yyyy-MM-dd");

        if (
          list[index - 1] === undefined ||
          isSameDay(list[index - 1].date, slot.date) === false
        ) {
          days[key] = [slot];
        } else {
          days[key].push(slot);
        }

        return days;
      }, {})
    ).map((day) => ({ day: day[0].date, hours: day }));

    setDays(days);
  }, [data]);

  if (days === null) return null;

  return (
    <div className="h-full flex justify-center items-center">
      <Week availability={days} />
    </div>
  );
}
