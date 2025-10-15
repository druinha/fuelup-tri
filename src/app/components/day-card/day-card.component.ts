import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Workout } from '../../model/workout.model';
@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
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
