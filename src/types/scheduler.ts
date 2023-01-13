export interface Scheduler2Event {
  text: string;
  startDate: Date;
  endDate: Date;
}

export interface SchedulerEvent {
  range: [number, number];
  event: string;
}

export interface SchedulerDay {
  events: SchedulerEvent[];
  day: string;
}

export interface Event {
  text: string;
  startDate: Date;
  endDate: Date;
  description: string;
  disabled: boolean;
  allDay: boolean;
  colorId: number;
}
