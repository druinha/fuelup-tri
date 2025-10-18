import { Component, Input, Output, EventEmitter } from '@angular/core';
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommonModule } from '@angular/common';
import { intlFormatDistance } from 'date-fns';
import { IonButtons, IonButton, IonToolbar, IonIcon, IonTitle, IonHeader } from "@ionic/angular/standalone";
import { Workout } from 'src/app/model/workout.model';
import { ModalController } from '@ionic/angular';
import { WorkoutDialogComponent } from '../workout-dialog/workout-dialog.component';
import { DayCardComponent } from '../day-card/day-card.component';


@Component({
  selector: 'app-week-header',
  standalone: true,
  templateUrl: './week-header.component.html',
  styleUrls: ['./week-header.component.scss'],
  imports: [IonHeader, IonTitle, IonIcon, IonToolbar, IonButtons, IonButton, CommonModule, ],
  providers: [ModalController]
})
export class WeekHeaderComponent  {


 @Input() weekStart!: Date;
  @Output() weekChange = new EventEmitter<Date>();

  start!: Date;
  end!: Date;

  constructor
  (
    private modalCtrl: ModalController
  ) {}

  ngOnChanges() {
    if (this.weekStart) {
      this.start = startOfWeek(this.weekStart, { weekStartsOn: 1 });
      this.end = endOfWeek(this.weekStart, { weekStartsOn: 1 });
    }
  }

  formatDate(date: Date, pattern: string) {
    return format(date, pattern, { locale: es });
  }

  prevWeek() {
    const newDate = subWeeks(this.weekStart, 1);
    this.weekChange.emit(newDate);
  }

  nextWeek() {
    const newDate = addWeeks(this.weekStart, 1);
    this.weekChange.emit(newDate);
  }
}