import { isSameDay, addDays, addHours, differenceInHours } from "date-fns";

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

export const groupContiguousBlocks = (blocks: string[] | Date[]): Date[][] => {
  const sorted = blocks
    .map((d) => (typeof d === "string" ? new Date(d) : d))
    .sort((a, b) => a.getTime() - b.getTime());

  return sorted.reduce((groups, date, index, list) => {
    const p = list[index - 1];
    const d = date;

    if (index === 0) {
      groups.push([d]);
    } else {
      if (differenceInHours(d, p) === 1) {
        groups[groups.length - 1].push(d);
      } else {
        groups.push([d]);
      }
    }

    return groups;
  }, []);
};

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe("groupContiguousBlocks", () => {
    const input = [
      "Sun Aug 21 2022 13:00:00 GMT-0700 (Pacific Daylight Time)",
      "Sun Aug 21 2022 14:00:00 GMT-0700 (Pacific Daylight Time)",
      "Sun Aug 21 2022 15:00:00 GMT-0700 (Pacific Daylight Time)",
      "Thu Aug 22 2022 12:00:00 GMT-0700 (Pacific Daylight Time)",
      "Tue Aug 23 2022 14:00:00 GMT-0700 (Pacific Daylight Time)",
      "Tue Aug 23 2022 15:00:00 GMT-0700 (Pacific Daylight Time)",
      "Thu Aug 25 2022 14:00:00 GMT-0700 (Pacific Daylight Time)",
    ];

    it("groups blocks that are in order", () => {
      const groups = groupContiguousBlocks(input);

      expect(groups).toHaveLength(4);
      expect(groups[0]).toHaveLength(3);
      expect(groups[1]).toHaveLength(1);
      expect(groups[2]).toHaveLength(2);
      expect(groups[3]).toHaveLength(1);
    });

    it("groups blocks when they are out of order", () => {
      const groups = groupContiguousBlocks([
        input[1],
        input[3],
        input[5],
        input[0],
        input[2],
        input[4],
        input[6],
      ]);

      expect(groups).toHaveLength(4);
      expect(groups[0]).toHaveLength(3);
      expect(groups[1]).toHaveLength(1);
      expect(groups[2]).toHaveLength(2);
      expect(groups[3]).toHaveLength(1);
    });
  });
}
