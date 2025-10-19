import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input, Output, EventEmitter } from '@angular/core';
import { Workout, WorkoutType } from '../../model/workout.model';
import { 
   IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonList,
  IonItemDivider, 
} from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';

interface WorkoutTypeOption {
  type: WorkoutType;
  label: string;
  svg: string;
}

@Component({
  selector: 'app-workout-dialog',
  templateUrl: './workout-dialog.component.html',
  standalone: true,
  styleUrls: ['./workout-dialog.component.scss'],
  imports: [
     CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonTextarea,
    IonInput,
    IonList,
    IonItemDivider,
  ],
    providers: [ModalController]
})


export class WorkoutDialogComponent  implements OnInit {

  

 @Input() day!: string;
  @Input() workout?: Workout;
  @Output() save = new EventEmitter<Workout>();
  @Output() close = new EventEmitter<void>();


 type: WorkoutType = 'running';
  comments = '';
  blocks: any[] = [];

  types: WorkoutTypeOption[] = [
    {
      type: 'rest',
      label: 'Descanso',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    },
    {
      type: 'running',
      label: 'Carrera',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    },
    {
      type: 'cycling',
      label: 'Bici',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    },
    {
      type: 'swimming',
      label: 'Natación',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" ...></svg>`,
    },
  ];


  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.workout) {
      this.type = this.workout.type;
      this.comments = this.workout.comments || '';
      this.blocks = this.workout.blocks || [];
    }
  }

  agregarBloque() {
    this.blocks.push({ nombre: '', distancia: '', duracion: '', ritmo: '', descanso: '', comentarios: '' });
  }

  eliminarBloque(index: number) {
    this.blocks.splice(index, 1);
  }

 async saveWorkout() {
  const workout: Workout = {
    type: this.type,
    comments: this.comments || undefined,
    blocks: this.blocks
  };

  this.save.emit(workout);

  // ✅ Return workout to parent when closing modal
  await this.modalCtrl.dismiss({ workout });
}

  async closeModal() {
    this.close.emit();
    await this.modalCtrl.dismiss();
  }
}