import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Workout } from 'src/app/model/workout.model';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Platform } from '@ionic/angular/standalone';
import { saveAs } from 'file-saver';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';



@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [IonIcon, IonButtons, IonButton, IonContent, IonTitle, IonToolbar, IonHeader, ],
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

  constructor(
    private modalCtrl: ModalController,
    private platform: Platform
  ) {}

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

   private makeEmojiPng(emoji: string, size = 48) {
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${size * scale}px system-ui, -apple-system, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Symbol", "Android Emoji"`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + (size * scale * 0.02));
    return canvas.toDataURL('image/png');
  }

  private buildPDF() {
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

    // map emojis to PNGs
    const emojiImageMap: Record<string, string> = {};
    Object.keys(icons).forEach(key => {
      emojiImageMap[key] = this.makeEmojiPng(icons[key], 36);
    });

    // get table rows
    const rawRows = Array.from(this.previewEl.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>)
      .map(row => {
        const cells = Array.from(row.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>);
        const day = cells[0]?.innerText.trim() || '';
        const sportEmoji = cells[1]?.innerText.trim() || '';
        const matchedType = Object.keys(icons).find(key => icons[key] === sportEmoji);
        const sportLabel = matchedType ? iconsForPDF[matchedType] : sportEmoji;
        const details = cells[2]?.innerText.trim() || '';
        return { day, sportLabel, details, matchedType: matchedType || null };
      });

    const tableBody = rawRows.map(r => [r.day, r.sportLabel, r.details]);
    const rowTypeMap: (string | null)[] = rawRows.map(r => r.matchedType);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`SEMANA DEL ${this.formatDate(start, "d 'de' MMMM")} AL ${this.formatDate(end, "d 'de' MMMM yyyy")}`, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Día', 'Deporte', 'Detalles']],
      body: tableBody,
      styles: { fontSize: 9, cellPadding: 3, valign: 'top' },
      headStyles: { fillColor: [26, 115, 232], textColor: 255 },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 120 } },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1) {
          const rowIndex = data.row.index;
          const matchedType = rowTypeMap[rowIndex];
          if (!matchedType) return;
          const imgDataUrl = emojiImageMap[matchedType];
          if (!imgDataUrl) return;
          const imgWidthMm = 6;
          const imgHeightMm = 6;
          const imgX = data.cell.x + 2;
          const imgY = data.cell.y + (data.cell.height / 2) - (imgHeightMm / 2);
          try {
            doc.addImage(imgDataUrl, 'PNG', imgX, imgY, imgWidthMm, imgHeightMm);
          } catch {}
        }
      }
    });

    return doc;
  }

  /** ✅ Export PDF to Downloads (Android) / FileSaver (iOS) / jsPDF (Web) */
async exportToPDF() {
  const doc = this.buildPDF();
  const pdfName = `Entrenamientos_${this.formatDate(this.weekStart, 'dd-MM-yyyy')}.pdf`;

  const pdfBlob = doc.output('blob');
  const reader = new FileReader();
  reader.readAsDataURL(pdfBlob);

  reader.onloadend = async () => {
    const base64data = (reader.result as string).split(',')[1];

    if (this.platform.is('android')) {
      try {
        // Save to Downloads using scoped storage
        const file = await Filesystem.writeFile({
          path: `Download/${pdfName}`,
          data: base64data,
          directory: Directory.ExternalStorage,
          recursive: true,
          encoding: 'base64' as Encoding
        });
        console.log('PDF saved to Downloads:', file.uri);

      } catch (e) {
        console.error('Error saving PDF:', e);
      }
    } else if (this.platform.is('ios')) {
      saveAs(pdfBlob, pdfName);
    } else {
      doc.save(pdfName);
    }
  };
}



  /** ✅ Share via WhatsApp */
   async sharePDF() {
    const doc = this.buildPDF();
    const pdfName = `Entrenamientos_${this.formatDate(this.weekStart, 'dd-MM-yyyy')}.pdf`;
    const pdfBlob = doc.output('blob');

    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async () => {
      const base64data = (reader.result as string).split(',')[1];

      const file = await Filesystem.writeFile({
        path: pdfName,
        data: base64data,
        directory: Directory.Cache, // temp
        recursive: true
      });

      await Share.share({
        title: 'Entrenamiento PDF',
        text: 'Aquí está tu PDF de entrenamiento',
        url: file.uri,
        dialogTitle: 'Compartir PDF'
      });
    };
  }


  close() {
    this.modalCtrl.dismiss();
  }
}