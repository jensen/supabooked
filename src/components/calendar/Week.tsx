import {
  isSameDay,
  format,
  isSameHour,
  differenceInHours,
  getDate,
} from "date-fns";
import { css } from "~/utils/styles";
import { Snooze } from "~/components/shared/Icons";

interface MonthProps {
  date: Date;
}

const Month = (props: MonthProps) => {
  return (
    <li className="text-gray-500 font-bold text-6xl py-4">
      {format(props.date, "MMMM")}
    </li>
  );
};

interface HourProps {
  hour: Date;
  current: boolean;
  onSelectHour: () => void;
  hasGap: boolean;
}

const Hour = (props: HourProps) => {
  return (
    <>
      {props.hasGap && (
        <li className={css("px-2 mr-2 flex items-center text-gray-500")}>
          <Snooze />
        </li>
      )}
      <li
        className="p-2 w-20 h-10 mr-2 bg-available flex justify-center items-center space-x-1 hover:bg-red-400"
        onClick={props.onSelectHour}
      >
        <span className="font-bold">{format(props.hour, "h")}</span>
        <span className="font-light text-gray-500 text-xs">
          {format(props.hour, "a")}
        </span>
      </li>
    </>
  );
};

interface DayProps {
  day: Date;
  current: boolean;
  hours: IHour[];
  onSelectHour: (hour: IHour) => void;
}

const Day = (props: DayProps) => {
  const now = new Date();

  return (
    <>
      {getDate(props.day) === 1 && <Month date={props.day} />}
      <li className="flex space-x-8 pb-4">
        <div className="w-20 flex flex-col">
          <h2 className="text-lg font-light text-gray-400">
            {format(new Date(props.day), "EEE")}
          </h2>
          <h3 className="text-3xl font-bold text-gray-300">
            {format(new Date(props.day), "do")}
          </h3>
        </div>
        <ul className="flex items-center">
          {props.hours.map((hour, index, list) => (
            <Hour
              key={hour.date.toString()}
              hour={hour.date}
              current={isSameHour(now, new Date(hour.date))}
              onSelectHour={() => props.onSelectHour(hour)}
              hasGap={
                index > 0 &&
                differenceInHours(hour.date, list[index - 1].date) > 1
              }
            />
          ))}
        </ul>
      </li>
    </>
  );
};

interface WeekProps {
  availability: IDay[];
  onSelectHour: (hour: IHour) => void;
}

export default function Week(props: WeekProps) {
  const today = new Date();

  return (
    <ul className="flex flex-col space-y-4">
      <Month date={props.availability[0].day} />
      {props.availability.map(({ day, hours }) => (
        <Day
          key={day.toString()}
          day={day}
          hours={hours}
          current={isSameDay(today, new Date(day))}
          onSelectHour={props.onSelectHour}
        />
      ))}
    </ul>
  );
}
