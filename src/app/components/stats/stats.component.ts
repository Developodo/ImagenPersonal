import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { jsPDF } from 'jspdf'; // Importa jsPDF de la forma correcta
import { MatButtonModule } from '@angular/material/button';
import html2canvas from 'html2canvas'; // Asegúrate de instalar html2canvas
import { NavbarComponent } from '../navbar/navbar.component';
import { Modules } from '../../data/modules';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgxChartsModule,
    MatLabel,
    MatFormFieldModule,
    MatButtonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  @ViewChild('chart') chartElement!: ElementRef;
  view: [number, number] = [700, 400]; // Tamaño del gráfico
  citasPorModulo: { name: string; value: number }[] = [];
  filteredCitas: { name: string; value: number }[] = [];
  selectedCourse: string = '';
  selectedMonth: string = '';

  months = [
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
  ];

  constructor(private eventService: FirestoreService) {}

  ngOnInit() {
    localStorage.removeItem('searchTerm');
    const currentCourse = this.getCurrentCourse();
    this.selectedCourse = this.getCurrentCourse();
    this.onCourseChange(currentCourse); // Cargar estadísticas del curso actua
    this.updateChartSize();
  }

  async onCourseChange(course: string) {
    this.selectedCourse = course;
    this.selectedMonth = ''; // Resetear el mes seleccionado
    this.citasPorModulo = await this.eventService.getEventsByCourse(course);
    this.filteredCitas = [...this.citasPorModulo]; // Mostrar todas las citas por defecto
  }

  onMonthChange(month: string) {
    this.selectedMonth = month;
    if (!month) {
      this.filteredCitas = [...this.citasPorModulo]; // Mostrar todo el curso
    } else {
      this.filteredCitas = this.citasPorModulo
        .map((cita: any) => {
          const monthData = cita.details.filter(
            (event: any) => event.month === month
          );
          return { name: cita.name, value: monthData.length };
        })
        .filter((cita) => cita.value > 0);
    }
  }

  // Escucha el cambio de tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateChartSize();
  }

  // Método para ajustar el tamaño del gráfico según el tamaño de la ventana
  updateChartSize() {
    const width = window.innerWidth;
    if (width < 600) {
      this.view = [width - 40, 300]; // Para dispositivos móviles
    } else if (width < 900) {
      this.view = [width - 50, 400]; // Para tablets y pantallas pequeñas
    } else {
      this.view = [700, 400]; // Para pantallas grandes
    }
  }

  getCurrentCourse(): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Mes en formato 0 (enero) - 11 (diciembre)

    // Si estamos antes de septiembre, el curso es el año anterior / el actual
    if (currentMonth < 8) {
      return `${currentYear - 1}/${currentYear}`;
    } else {
      // Si estamos en septiembre o después, el curso es el año actual / el siguiente
      return `${currentYear}/${currentYear + 1}`;
    }
  }

  exportToPDF() {
    const chart = this.chartElement.nativeElement.querySelector('svg'); // Selecciona el SVG

    console.log(chart);

    // Eliminar cualquier posible transparencia o efecto visual antes de capturar
    chart.style.opacity = '1';
    chart.style.filter = 'none';
    chart.style.background = '#FFFFFF'; // Forzar fondo blanco

    // Convertir el SVG a una cadena
    const svgData = new XMLSerializer().serializeToString(chart);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    // Crear una imagen que cargue el SVG
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;

    img.onload = () => {
      // Aumentar la calidad multiplicando por un factor de escala
      const scale = 2; // Factor de escala, 2 es una buena opción para mejorar calidad

      // Establecer el tamaño del canvas al tamaño del SVG multiplicado por la escala
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Aumentar la calidad dibujando con la escala mayor
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      // Convertir el canvas a imagen base64 con mayor calidad
      const imgData = canvas.toDataURL('image/png', 1.0); // Asegurarse de que la calidad sea 1.0

      const imgWidth = 210; // Ancho A4 en mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const doc = new jsPDF({
        orientation: imgHeight > pageHeight ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      // Generar la cabecera (Curso y Mes, si se seleccionó)
      const headerText = this.selectedMonth
        ? `${this.selectedCourse} - ${this.getMonthLabel(this.selectedMonth)}`
        : this.selectedCourse;

      doc.setFontSize(16);
      // Agregar la cabecera centrada en la parte superior
      doc.text(headerText, doc.internal.pageSize.getWidth() / 2, 15, {
        align: 'center',
      });
      // Agregar la imagen al PDF
      doc.addImage(imgData, 'PNG', 10, 25, imgWidth - 20, imgHeight);

      // Guardar el PDF
      doc.save(`imagen_${this.getCurrentCourse()}.pdf`);
    };
  }

  getMonthLabel(monthValue: string): string {
    const month = this.months.find((m) => m.value === monthValue);
    return month ? month.label : '';
  }
}
