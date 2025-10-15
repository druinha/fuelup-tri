export type WorkoutType = 'rest' | 'running' | 'cycling' | 'swimming';

export interface Workout {
  type: WorkoutType;
  distance?: string;
  duration?: string;
  zones?: string[];
  comments?: string;
}
