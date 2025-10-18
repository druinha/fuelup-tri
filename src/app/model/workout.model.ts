export type WorkoutType = 'rest' | 'running' | 'cycling' | 'swimming';

export interface Workout {
  type: WorkoutType;
  comments?: string;
  blocks?: {
    nombre: string;
    distancia?: string;
    duracion?: string;
    ritmo?: string;
    descanso?: string;
    comentarios?: string;
  }[];
}
