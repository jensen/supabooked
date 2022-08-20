interface IHour {
  date: Date;
  session: any;
}

interface IDay {
  day: Date;
  hours: IHour[];
}
