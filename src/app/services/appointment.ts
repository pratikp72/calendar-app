import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [];
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  addAppointment(appointment: Appointment): void {
    this.appointments.push(appointment);
    this.appointmentsSubject.next([...this.appointments]);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const index = this.appointments.findIndex(apt => apt.id === updatedAppointment.id);
    if (index !== -1) {
      this.appointments[index] = updatedAppointment;
      this.appointmentsSubject.next([...this.appointments]);
    }
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(apt => apt.id !== id);
    this.appointmentsSubject.next([...this.appointments]);
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.appointments.filter(apt => {
      const startDate = new Date(apt.startTime);
      startDate.setHours(0, 0, 0, 0);
      return startDate.getTime() === targetDate.getTime();
    });
  }

  getAppointmentsForWeek(startDate: Date): Appointment[] {
    const weekEnd = new Date(startDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return this.appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= startDate && aptDate < weekEnd;
    });
  }
}
