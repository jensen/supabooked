interface IHour {
  date: Date;
  session: any;
}

interface IDay {
  day: Date;
  hours: IHour[];
}

/* to be generated */

interface ISession {
  id: string;
  title: string;
  description: string;
  scheduled_from: string;
  scheduled_to: string;
}

interface IInvitation {
  id: string;
  email: string;
  title: string;
  description: string;
  viewed: boolean;
  emailed: boolean;
  user_id: string;
}
