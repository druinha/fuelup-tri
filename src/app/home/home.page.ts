import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Workout } from '../model/workout.model';
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { WeekHeaderComponent } from '../components/week-header/week-header.component';
import { DayCardComponent } from '../components/day-card/day-card.component';
import { ExportDialogComponent } from '../components/export-dialog/export-dialog.component';
import { WorkoutDialogComponent } from '../components/workout-dialog/workout-dialog.component';

const DAYS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle,
     IonContent, CommonModule,
      WeekHeaderComponent,
      DayCardComponent,
      ExportDialogComponent,
      WorkoutDialogComponent
    ],
})
export class HomePage {
  constructor() {}

  workouts: Record<string, Workout> = {};
  selectedDay: string | null = null;
  weekStart: Date = new Date();
  days = DAYS;

  selectDay(day: string) {
    this.selectedDay = day;
  }

  saveWorkout(day: string, workout: Workout) {
    this.workouts[day] = workout;
    this.selectedDay = null;
  }

  deleteWorkout(day: string) {
    delete this.workouts[day];
  }

  prevWeek() {
    this.weekStart = subWeeks(this.weekStart, 1);
  }

  nextWeek() {
    this.weekStart = addWeeks(this.weekStart, 1);
  }
}
