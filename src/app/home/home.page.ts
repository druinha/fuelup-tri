import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, ModalController, IonFab, IonFabButton, IonIcon  } from '@ionic/angular/standalone';
import { Workout } from '../model/workout.model';
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
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
      WorkoutDialogComponent,
      IonFab, IonFabButton, IonIcon
    ],
    providers: [ModalController]
})
export class HomePage {
  constructor(
    private modalCtrl: ModalController
  ) {}

  workouts: Record<string, Workout> = {};
  selectedDay: string | null = null;
  weekStart: Date = new Date();
  days = DAYS;

  selectDay(day: string) {
    this.selectedDay = day;
  }

  async openWorkoutModal(day: string) {
  const modal = await this.modalCtrl.create({
    component: WorkoutDialogComponent,
    componentProps: {
      day,
      workout: this.workouts[day] ?? null
    },
    cssClass: 'workout-modal',
    backdropDismiss: true
  });

  const result = await modal.present();
  modal.onDidDismiss().then(res => {
    if (res.data?.workout) this.saveWorkout(day, res.data.workout);
  });
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

  async openExportModal() {
  const modal = await this.modalCtrl.create({
    component: ExportDialogComponent,
    componentProps: {
      workouts: this.workouts,
      weekStart: this.weekStart,
      days: this.days
    },
    cssClass: 'export-modal'
  });

  await modal.present();
}
}
