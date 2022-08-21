import { isSameDay, format, isSameHour, isBefore, addHours } from "date-fns";
import { css } from "~/utils/styles";

interface HourProps {
  hour: Date;
  current: boolean;
  available: boolean;
  selected: boolean;
  onSelectHour: () => void;
}

const Hour = (props: HourProps) => {
  const now = new Date();

  return (
    <li
      className={css(
        "p-2 w-20 h-10 border-t border-l border-border bg-available last-of-type:border-b",
        {
          "bg-unavailable bg-unavailable-pattern":
            props.available === false || isBefore(props.hour, addHours(now, 1)),
          "hover:bg-red-400":
            props.available === true &&
            isBefore(props.hour, addHours(now, 1)) === false,
          "hover:bg-red-200":
            props.selected &&
            props.available === true &&
            isBefore(props.hour, addHours(now, 1)) === false,
          "bg-red-400": props.selected,
        }
      )}
      onClick={props.onSelectHour}
    >
      &nbsp;
    </li>
  );
};

interface DayProps {
  day: Date;
  current: boolean;
  hours: IHour[];
  selectedHours: IHour[];
  onSelectHour: (hour: IHour) => void;
}

const Day = (props: DayProps) => {
  const now = new Date();

  return (
    <div
      className={css("last-of-type:border-r border-border", {
        "text-red-400": props.current,
      })}
    >
      <div className="h-20 flex flex-col items-center ">
        <h2 className="text-lg">{format(new Date(props.day), "EEE")}</h2>
        <h3 className="text-3xl font-bold">
          {format(new Date(props.day), "dd")}
        </h3>
      </div>
      <ul
        className={css("", {
          "bg-slate-600 text-white": props.current,
        })}
      >
        {props.hours.map((hour) => (
          <Hour
            key={hour.date.toString()}
            hour={hour.date}
            current={isSameHour(now, new Date(hour.date))}
            available={hour.session === null}
            selected={
              props.selectedHours.find(
                (selected) => selected.date === hour.date
              ) !== undefined
            }
            onSelectHour={() => props.onSelectHour(hour)}
          />
        ))}
      </ul>
    </div>
  );
};

interface WeekProps {
  availability: IDay[];
  selectedHours: IHour[];
  onSelectHour: (hour: IHour) => void;
}

export default function Week(props: WeekProps) {
  const today = new Date();

  return (
    <ul className="flex border-border">
      <div className="text-gray-400">
        <div className="h-20">&nbsp;</div>
        <ul>
          {props.availability[0].hours.map((hour) => (
            <li
              key={hour.date.toString()}
              className={css(
                "flex justify-end pr-2 w-24 h-10 text-xs font-light"
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
          selectedHours={props.selectedHours}
          onSelectHour={props.onSelectHour}
        />
      ))}
    </ul>
  );
}
