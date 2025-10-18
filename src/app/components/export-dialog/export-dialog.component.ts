import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Workout } from 'src/app/model/workout.model';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonTextarea, IonButton, IonButtons, IonIcon } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [IonIcon, IonButtons, IonButton, IonTextarea, IonContent, IonTitle, IonToolbar, IonHeader, ],
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  providers: [ModalController]
})
export class ExportDialogComponent {

  @Input() workouts: Record<string, Workout> = {};
  @Input() weekStart!: Date;
  @Input() days: string[] = [];

  @ViewChild('preview', { static: false }) previewEl!: ElementRef<HTMLDivElement>;

  previewHTML = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.generatePreview();
  }

  formatDate(date: Date, pattern: string) {
    return format(date, pattern, { locale: es });
  }

  /** ✅ Generate HTML preview inside the modal */
  generatePreview() {
    const start = startOfWeek(this.weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(this.weekStart, { weekStartsOn: 1 });

    const icons: Record<string, string> = {
      rest: '🛋️',
      running: '🏃‍♂️',
      cycling: '🚴‍♂️',
      swimming: '🏊‍♂️'
    };

    let html = `
      <h2>Semana del ${this.formatDate(start, "d 'de' MMMM")} al ${this.formatDate(end, "d 'de' MMMM yyyy")}</h2>
      <table class="preview-table">
        <thead>
          <tr><th>Día</th><th>Deporte</th><th>Detalles</th></tr>
        </thead>
        <tbody>
    `;

    this.days.forEach(day => {
      const workout = this.workouts[day];
      const type = workout?.type ?? 'rest';
      const icon = icons[type] || '❓';
      let details = '';

      if (!workout || workout.type === 'rest') {
        details = 'Descanso';
      } else if (workout.blocks?.length) {
        details = workout.blocks.map(block => `
          <strong>${block.nombre?.toUpperCase() || 'BLOQUE'}</strong>:
          ${block.distancia || ''} ${block.duracion || ''} 
          ${block.ritmo ? `(Zona: ${block.ritmo})` : ''}
          ${block.descanso ? `Descanso: ${block.descanso}` : ''}
          ${block.comentarios ? `<div>${block.comentarios}</div>` : ''}
        `).join('<hr>');
      } else {
        details = `
          ${workout.comments ? `Comentarios: ${workout.comments}` : ''}
        `;
      }

      html += `
        <tr>
          <td>${day}</td>
          <td style="text-align:center">${icon}</td>
          <td>${details}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    this.previewHTML = html;
  }

  /** ✅ Generate & Download the PDF */
  exportToPDF() {
    const start = startOfWeek(this.weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(this.weekStart, { weekStartsOn: 1 });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`SEMANA DEL ${this.formatDate(start, "d 'de' MMMM")} AL ${this.formatDate(end, "d 'de' MMMM yyyy")}`, 14, 15);

    const rows: any[] = Array.from(this.previewEl.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>)
      .map((row: HTMLTableRowElement) => {
        const cells = Array.from(row.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>);
        return cells.map(td => td.innerText.trim());
      });

    autoTable(doc, {
      startY: 25,
      head: [['Día', 'Deporte', 'Detalles']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
      headStyles: { fillColor: [26, 115, 232], textColor: 255 },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 20 }, 2: { cellWidth: 130 } }
    });

    doc.save(`Entrenamientos_${this.formatDate(this.weekStart, 'dd-MM-yyyy')}.pdf`);
  }

  /** ✅ Share via WhatsApp */
  shareWhatsApp() {
    const text = this.previewEl.nativeElement.innerText.replace(/\s+/g, ' ').trim();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  close() {
    this.modalCtrl.dismiss();
  }
}