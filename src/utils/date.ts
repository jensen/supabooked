import { isSameDay, addDays, addHours } from "date-fns";

export const getWeekRange = (start: Date, end: Date) => {
  const days = [];

  let current = start;

  while (isSameDay(current, end) === false) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
};

export const getHourRange = (day: Date) => {
  const hours = [];
  const next = addDays(day, 1);

  let current = day;

  while (isSameDay(current, next) === false) {
    hours.push(current);
    current = addHours(current, 1);
  }

  return hours;
};
