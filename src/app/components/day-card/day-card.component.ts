import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Workout } from '../../model/workout.model';
import { CommonModule } from '@angular/common';
import { IonCard, IonButton, IonCardHeader, IonItem, IonCardTitle, IonCardContent, IonIcon, IonLabel, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
  standalone: true,
  imports: [IonText, IonLabel, IonIcon, IonCardContent, IonCardTitle, IonItem, IonCardHeader, IonButton, IonCard, CommonModule],
})
export class DayCardComponent  {

 @Input() day!: string;
  @Input() workout?: Workout;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  workoutLabel(type: string) {
    const labels: Record<string,string> = { rest:'Descanso', running:'Carrera', cycling:'Bici', swimming:'Natación' };
    return labels[type] || '';
  }

  workoutIcon(type: string) {
    const icons: Record<string,string> = { rest:'moon-outline', running:'walk-outline', cycling:'bicycle-outline', swimming:'water-outline' };
    return icons[type] || '';
  }
}
