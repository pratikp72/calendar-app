export interface Appointment {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  color?: string;
}
