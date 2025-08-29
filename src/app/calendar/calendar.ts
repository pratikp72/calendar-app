import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment';
import { Appointment } from '../models/appointment';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentView: 'week' | 'day' = 'week';
  appointments: Appointment[] = [];
  weekDays: Date[] = [];
  hours: number[] = Array.from({length: 24}, (_, i) => i);
  
  showAppointmentModal = false;
  newAppointment: Partial<Appointment> = {};
  draggedAppointment: Appointment | null = null;
  dragStartPosition = { x: 0, y: 0 };

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.updateWeekDays();
    this.appointmentService.appointments$.subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  updateWeekDays() {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDays = Array.from({length: 7}, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  switchView(view: 'week' | 'day') {
    this.currentView = view;
  }

  navigateWeek(direction: number) {
    this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
    this.updateWeekDays();
  }

  navigateDay(direction: number) {
    this.currentDate.setDate(this.currentDate.getDate() + direction);
    this.updateWeekDays();
  }

  openAppointmentModal(date: Date, hour: number) {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    this.newAppointment = {
      title: '',
      startTime,
      endTime,
      description: '',
      color: '#3498db'
    };
    this.showAppointmentModal = true;
  }

  saveAppointment() {
    if (this.newAppointment.title && this.newAppointment.startTime && this.newAppointment.endTime) {
      const appointment: Appointment = {
        id: this.generateId(),
        title: this.newAppointment.title,
        startTime: this.newAppointment.startTime,
        endTime: this.newAppointment.endTime,
        description: this.newAppointment.description || '',
        color: this.newAppointment.color || '#3498db'
      };
      this.appointmentService.addAppointment(appointment);
      this.closeAppointmentModal();
    }
  }

  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.newAppointment = {};
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getAppointmentsForDateAndHour(date: Date, hour: number): Appointment[] {
    return this.appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString() && 
             aptDate.getHours() <= hour && 
             new Date(apt.endTime).getHours() > hour;
    });
  }

  onDragStart(event: DragEvent, appointment: Appointment) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', appointment.id);
      this.draggedAppointment = appointment;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, date: Date, hour: number) {
    event.preventDefault();
    if (this.draggedAppointment) {
      const newStartTime = new Date(date);
      newStartTime.setHours(hour, 0, 0, 0);
      
      const duration = this.draggedAppointment.endTime.getTime() - this.draggedAppointment.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const updatedAppointment: Appointment = {
        ...this.draggedAppointment,
        startTime: newStartTime,
        endTime: newEndTime
      };

      this.appointmentService.updateAppointment(updatedAppointment);
      this.draggedAppointment = null;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
  }

  onStartTimeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newAppointment.startTime = new Date(target.value);
  }

  onEndTimeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newAppointment.endTime = new Date(target.value);
  }

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
