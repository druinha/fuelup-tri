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

    const iconsForPDF: Record<string, string> = {
      rest: 'Descanso',
      running: 'Correr',  
      cycling: 'Ciclismo',
      swimming: 'Natación'
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

  // emoji -> text mapping
  const icons: Record<string, string> = {
    rest: '🛋️',
    running: '🏃‍♂️',
    cycling: '🚴‍♂️',
    swimming: '🏊‍♂️'
  };

  const iconsForPDF: Record<string, string> = {
    rest: 'Descanso',
    running: 'Correr',
    cycling: 'Ciclismo',
    swimming: 'Natación'
  };

  // helper: create a PNG dataURL from an emoji by drawing it to a canvas
  const makeEmojiPng = (emoji: string, size = 48): string => {
    const canvas = document.createElement('canvas');
    const scale = 2; // increase for better resolution
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d')!;
    // transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Use a font likely to render emoji — use system fallback (emoji will be rendered by browser)
    ctx.font = `${size * scale}px system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Symbol", "Android Emoji"`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    // Draw emoji in the center
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + (size * scale * 0.02));
    // return PNG data URL
    return canvas.toDataURL('image/png');
  };

  // Pre-generate image dataUrls for each emoji type
  const emojiImageMap: Record<string, string> = {};
  Object.keys(icons).forEach(key => {
    emojiImageMap[key] = makeEmojiPng(icons[key], 36); // 36px base size
  });

  // Build rows from preview (same as before), but include the type key so we know which image to draw
  const rawRows = Array.from(
    this.previewEl.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>
  ).map((row: HTMLTableRowElement) => {
    const cells = Array.from(row.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>);
    const day = cells[0].innerText.trim();
    const sportEmoji = cells[1].innerText.trim();
    // find key by matching emoji (icons map)
    const matchedType = Object.keys(icons).find(key => icons[key] === sportEmoji);
    const sportLabel = matchedType ? iconsForPDF[matchedType] : sportEmoji;
    const details = cells[2].innerText.trim();
    // return object so we can access matchedType later in didDrawCell
    return { day, sportLabel, details, matchedType: matchedType || null };
  });

  // Convert to table body (text fallback)
  const tableBody = rawRows.map(r => [r.day, r.sportLabel, r.details]);

  // Create doc
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text(
    `SEMANA DEL ${this.formatDate(start, "d 'de' MMMM")} AL ${this.formatDate(end, "d 'de' MMMM yyyy")}`,
    14,
    15
  );

  // Keep a mapping from row index to matchedType (so didDrawCell knows which image to render)
  const rowTypeMap: (string | null)[] = rawRows.map(r => r.matchedType);

  // Use autotable and draw image inside cells
  autoTable(doc, {
    startY: 25,
    head: [['Día', 'Deporte', 'Detalles']],
    body: tableBody,
    styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
    headStyles: { fillColor: [26, 115, 232], textColor: 255 },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 120 } },

    // hook called after each cell is drawn — we'll add the emoji image for column 1 ("Deporte")
    didDrawCell: (data: any) => {
      // only draw in body rows and column index 1 (second column)
      if (data.section === 'body' && data.column.index === 1) {
        const rowIndex = data.row.index; // 0-based index in body
        const matchedType = rowTypeMap[rowIndex];
        if (!matchedType) return;

        const imgDataUrl = emojiImageMap[matchedType];
        if (!imgDataUrl) return;

        // compute image size and position (adjust as needed)
        // data.cell has x, y, width, height
        const imgWidthMm = 6; // mm
        const imgHeightMm = 6; // mm

        // convert px to mm is handled automatically by jsPDF.addImage using units=mm when we pass mm dims
        // place icon with a small left padding inside the cell
        const imgX = data.cell.x + 2;
        const imgY = data.cell.y + (data.cell.height / 2) - (imgHeightMm / 2);

        try {
          doc.addImage(imgDataUrl, 'PNG', imgX, imgY, imgWidthMm, imgHeightMm);
          // optionally shift the text right so icon doesn't overlap — we already have text in the cell,
          // but if it overlaps you could redraw the text manually. Usually cellPadding handles it.
        } catch (e) {
          // fallback: ignore drawing if addImage fails
          // console.warn('addImage failed for emoji', e);
        }
      }
    }
  });

  // Save file
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