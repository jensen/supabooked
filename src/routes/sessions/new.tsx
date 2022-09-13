import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import {
  isBefore,
  getHours,
  isSameDay,
  format,
  getDate,
  addHours,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import Button from "~/components/shared/Button";
import Week from "~/components/calendar/Week";
import { getUser } from "~/services/session";
import { groupContiguousBlocks } from "~/utils/date";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const title = body.get("subject") as string;
  const description = body.get("description") as string;
  const selected = body.getAll("selected") as string[];

  const { user, accessToken } = await getUser(request);

  if (!user) {
    throw new Error("Must be logged in");
  }

  await supabaseClient(accessToken)
    .from("sessions")
    .insert(
      groupContiguousBlocks(selected).map((item) => {
        return {
          title,
          description,
          scheduled_from: item[0],
          scheduled_to: addHours(item[item.length - 1], 1),
          user_id: user.id,
        };
      })
    );

  return redirect(`/schedule`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = new URL(request.url).searchParams.get("invitation");
  const { accessToken } = await getUser(request);

  const client = supabaseClient(accessToken);

  const [calendar, settings, invitation] = await Promise.all([
    client.rpc("get_calendar"),
    client.from("settings").select().single(),
    client
      .from("invitations")
      .update({ viewed: true })
      .match({ id })
      .select()
      .single(),
  ]);

  return json({
    availability: calendar.data,
    settings: settings.data,
    invitation: invitation.data || null,
  });
};

interface ILoaderData {
  availability: {
    date: string;
    session: any;
  }[];
  settings: { timezone: string; start_time: number; end_time: number };
  invitation: unknown | null;
}

export default function New() {
  const data = useLoaderData<ILoaderData>();
  const [days, setDays] = useState<IDay[] | null>(null);
  const [selectedHours, setSelectedHours] = useState<IHour[]>([]);

  useEffect(() => {
    const slots = data.availability
      .map((slot) => ({ date: new Date(slot.date), session: slot.session }))
      .filter(({ date }) => {
        return (
          getHours(utcToZonedTime(date, data.settings.timezone)) >=
            data.settings.start_time &&
          getHours(utcToZonedTime(date, data.settings.timezone)) <
            data.settings.end_time &&
          getDate(date) >= getDate(new Date()) &&
          getDate(date) < getDate(new Date()) + 7
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

  const handleSelectHour = (hour) => {
    if (
      hour.session === null &&
      isBefore(hour.date, addHours(new Date(), 1)) === false
    ) {
      setSelectedHours((prev) =>
        /* toggle the selected state */
        prev.find((h) => h === hour)
          ? prev.filter((h) => h !== hour)
          : [...prev, hour]
      );
    }
  };

  return (
    <>
      <Form className="flex" method="post">
        <div className="flex flex-col space-y-12 justify-center">
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
          </div>
          <Button>Book</Button>
        </div>
        <div className="flex-grow flex justify-end">
          <Week
            availability={days}
            selectedHours={selectedHours}
            onSelectHour={handleSelectHour}
          />
          {selectedHours.map(({ date }) => (
            <input
              key={date.toString()}
              type="hidden"
              name="selected"
              value={date.toString()}
            />
          ))}
        </div>
      </Form>
    </>
  );
}
