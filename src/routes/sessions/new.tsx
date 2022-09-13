import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import supabaseClient from "~/services/supabase";
import { isBefore, getHours, setHours, isSameDay, addHours } from "date-fns";
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

  const [calendar, invitation] = await Promise.all([
    client.rpc("get_calendar"),
    client
      .from("invitations")
      .update({ viewed: true })
      .match({ id })
      .select()
      .single(),
  ]);

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

const getHourRange = (availability: IAvailability[]) => {
  let min = new Date(availability[0].date);
  let max = new Date(availability[0].date);

  for (const slot of availability) {
    const date = new Date(slot.date);

    if (getHours(date) < getHours(min)) {
      min = date;
    }

    if (getHours(date) > getHours(max)) {
      max = date;
    }
  }

  return [getHours(min), getHours(max)];
};

export default function New() {
  const data = useLoaderData<ILoaderData>();
  const [days, setDays] = useState<IDay[] | null>(null);
  const [selectedHours, setSelectedHours] = useState<IHour[]>([]);

  useEffect(() => {
    const range = getHourRange(data.availability);

    const start = Math.max(0, range[0]);
    const end = Math.min(range[1], 23);

    const days = getDays(data.availability).map((day) => {
      const hours = [];

      for (
        let date = setHours(day, start);
        date <= setHours(day, end);
        date = addHours(date, 1)
      ) {
        const session =
          data.availability.find((slot) => {
            return new Date(slot.date).getTime() === date.getTime();
          })?.session || null;

        hours.push({ date, session });
      }

      return { day, hours };
    });

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
