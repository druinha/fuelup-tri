import { Component, Input } from '@angular/core';
import { Workout } from 'src/app/model/workout.model';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonTextarea, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [IonButton, IonTextarea, IonContent, IonTitle, IonToolbar, IonHeader, ],
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent {

  @Input() workouts: Record<string, Workout> = {};
  @Input() weekStart!: Date;
  @Input() days: string[] = [];

  generateText() {
    const start = startOfWeek(this.weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(this.weekStart, { weekStartsOn: 1 });
    let text = `SEMANA DEL ${format(start, 'd', { locale: es })} AL ${format(end, "d 'DE' MMMM", { locale: es }).toUpperCase()}\n\n`;

    const labels: Record<string, string> = {
      rest: 'DESCANSO',
      running: 'CARRERA',
      cycling: 'BICI',
      swimming: 'NATACIÓN'
    };

    this.days.forEach(day => {
      text += `${day}\n`;

      const workout = this.workouts[day];

      if (!workout || workout.type === 'rest') {
        text += 'DESCANSO\n\n';
      } else {
        text += `${labels[workout.type]}\n`;

        if (workout.blocks?.length) {
          workout.blocks.forEach(block => {
            text += `  - ${block.nombre ? block.nombre.toUpperCase() : 'Bloque'}: `;
            if (block.distancia) text += `${block.distancia} `;
            if (block.duracion) text += `${block.duracion} `;
            if (block.ritmo) text += `(Ritmo/Zona: ${block.ritmo}) `;
            if (block.descanso) text += `Descanso: ${block.descanso}. `;
            if (block.comentarios) text += `\n    ${block.comentarios}`;
            text += `\n`;
          });
        }

        if (workout.comments) {
          text += `\nComentarios generales: ${workout.comments}\n`;
        }

        text += `\n`;
      }
    });

    return text;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generateText());
    alert('Copiado al portapapeles!');
  }

  shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(this.generateText())}`;
    window.open(url, '_blank');
  }
}
