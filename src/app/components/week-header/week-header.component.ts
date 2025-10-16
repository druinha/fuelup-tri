import { Component, Input, Output, EventEmitter } from '@angular/core';
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { intlFormatDistance } from 'date-fns';
import { IonButtons, IonButton, IonToolbar, IonIcon, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-week-header',
  standalone: true,
  templateUrl: './week-header.component.html',
  styleUrls: ['./week-header.component.scss'],
  imports: [IonTitle, IonIcon, IonToolbar, IonButtons, IonButton, ],
})
export class WeekHeaderComponent  {

@Input() weekStart!: Date;
  @Output() weekChange = new EventEmitter<Date>();

  get start() { return startOfWeek(this.weekStart, { weekStartsOn: 1 }); }
  get end() { return endOfWeek(this.weekStart, { weekStartsOn: 1 }); }

  prevWeek() { this.weekChange.emit(subWeeks(this.weekStart, 1)); }
  nextWeek() { this.weekChange.emit(addWeeks(this.weekStart, 1)); }

  formatDate(date: Date, fmt: string) { return format(date, fmt, { locale: es }); }

}
