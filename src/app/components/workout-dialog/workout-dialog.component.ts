import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Workout, WorkoutType } from '../../model/workout.model';

@Component({
  selector: 'app-workout-dialog',
  templateUrl: './workout-dialog.component.html',
  styleUrls: ['./workout-dialog.component.scss'],
})
export class WorkoutDialogComponent  implements OnInit {

   @Input() day!: string;
  @Input() workout?: Workout;
  @Output() save = new EventEmitter<Workout>();
  @Output() close = new EventEmitter<void>();

  type: WorkoutType = 'running';
  distance = '';
  duration = '';
  selectedZones: string[] = [];
  comments = '';

  ZONES = ['Z1','Z2','Z3','Z4','Z5'];
  types: { type: WorkoutType, label:string, icon:string }[] = [
    {type:'rest', label:'Descanso', icon:'moon-outline'},
    {type:'running', label:'Carrera', icon:'walk-outline'},
    {type:'cycling', label:'Bici', icon:'bicycle-outline'},
    {type:'swimming', label:'Natación', icon:'water-outline'}
  ];

  constructor() { }

  ngOnInit() {
    if(this.workout) {
      this.type = this.workout.type;
      this.distance = this.workout.distance || '';
      this.duration = this.workout.duration || '';
      this.selectedZones = this.workout.zones || [];
      this.comments = this.workout.comments || '';
    }
    
  }

   toggleZone(zone: string) {
    if(this.selectedZones.includes(zone)) this.selectedZones = this.selectedZones.filter(z => z !== zone);
    else this.selectedZones.push(zone);
  }

  saveWorkout() {
    const workout: Workout = {
      type: this.type,
      distance: this.distance || undefined,
      duration: this.duration || undefined,
      zones: this.selectedZones.length ? this.selectedZones : undefined,
      comments: this.comments || undefined
    };
    this.save.emit(workout);
  }

}
