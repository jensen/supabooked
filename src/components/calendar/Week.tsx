import { isSameDay, format, isSameHour } from "date-fns";
import { css } from "~/utils/styles";

interface HourProps {
  hour: Date;
  current: boolean;
  available: boolean;
}

const Hour = (props: HourProps) => {
  return (
    <li
      className={css(
        "p-2 w-24 h-12 border-t border-l border-border bg-available",
        {
          "bg-unavailable": props.available === false,
          "hover:bg-red-400": props.available === true,
        }
      )}
    >
      &nbsp;
    </li>
  );
};

interface DayProps {
  day: Date;
  current: boolean;
  hours: IHour[];
}

const Day = (props: DayProps) => {
  const now = new Date();

  return (
    <div className={css({ "text-red-400": props.current })}>
      <div className="h-20 flex flex-col items-center ">
        <h2 className="text-lg">{format(new Date(props.day), "EEE")}</h2>
        <h3 className="text-3xl font-light">
          {format(new Date(props.day), "dd")}
        </h3>
      </div>
      <ul
        className={css({
          "bg-slate-600 text-white": props.current,
        })}
      >
        {props.hours.map((hour) => (
          <Hour
            key={hour.date.toString()}
            hour={hour.date}
            current={isSameHour(now, new Date(hour.date))}
            available={hour.session === null}
          />
        ))}
      </ul>
    </div>
  );
};

interface WeekProps {
  availability: IDay[];
}

export default function Week(props: WeekProps) {
  const today = new Date();

  return (
    <ul className="flex border-b border-r border-border">
      <div>
        <div className="h-20">&nbsp;</div>
        <ul>
          {props.availability[0].hours.map((hour) => (
            <li
              key={hour.date.toString()}
              className={css(
                "grid place-content-center w-24 h-12 text-sm font-light"
              )}
            >
              {format(new Date(hour.date), "HH:mm")}
            </li>
          ))}
        </ul>
      </div>
      {props.availability.map(({ day, hours }) => (
        <Day
          key={day.toString()}
          day={day}
          hours={hours}
          current={isSameDay(today, new Date(day))}
        />
      ))}
    </ul>
  );
}
