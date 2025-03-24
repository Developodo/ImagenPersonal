import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Modules } from '../../data/modules';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { FirstletterPipe } from '../../pipes/firstletter.pipe';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FirstletterPipe, FooterComponent],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css',
})
export class TimetableComponent {
  moduleList: any = []; // Lista de módulos
  moduleHours: any = {}; // Horarios de todos los módulos
  daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  timeSlots: string[] = [
    '08:15',
    '09:15',
    '10:15',
    '11:45',
    '12:45',
    '13:45',
    '15:00',
    '15:45',
    '16:45',
    '18:00',
    '19:00',
    '20:00',
  ]; // Las franjas horarias
  loading = inject(LoadingService);
  showMorning: { [moduleName: string]: boolean } = {};
  showAfternoon: { [moduleName: string]: boolean } = {};
  constructor(
    private yourService: FirestoreService,
    private toastService: ToastService
  ) {
    this.moduleList.forEach((m: any) => {
      this.showMorning[m.name] = false;
      this.showAfternoon[m.name] = false;
    });
  }

  ngOnInit(): void {
    // Cargar lista de módulos y horarios al iniciar
    this.loadAllModulesHours();
    localStorage.removeItem('searchTerm');
  }

  // Cargar la lista de módulos y los horarios de todos los módulos
  async loadAllModulesHours() {
    try {
      // Obtener la lista de módulos
      this.moduleList = Modules.modules;

      // Cargar los horarios de cada módulo
      this.loading.show();
      this.moduleHours = await this.yourService.getModuleHours();
      this.loading.hide();
    } catch (error) {
      console.error(
        'Error al cargar los horarios de todos los módulos:',
        error
      );
    }
  }

  // Comprobar si una franja horaria está seleccionada
  isTimeSlotSelected(module: string, day: string, timeSlot: string): boolean {
    return this.moduleHours[module]?.[day]?.includes(timeSlot) || false;
  }

  // Alternar la selección de una franja horaria
  toggleTimeSlot(module: string, day: string, timeSlot: string) {
    if (!this.moduleHours[module]) {
      this.moduleHours[module] = {};
    }
    if (!this.moduleHours[module][day]) {
      this.moduleHours[module][day] = [];
    }

    const index = this.moduleHours[module][day].indexOf(timeSlot);

    if (index > -1) {
      // Si la franja ya está seleccionada, la deseleccionamos
      this.moduleHours[module][day].splice(index, 1);
    } else {
      // Si no está seleccionada, la agregamos
      this.moduleHours[module][day].push(timeSlot);
    }
  }

  // Guardar todos los horarios de los módulos en Firestore
  async saveAllModulesHours() {
    try {
      // Guardar los horarios de todos los módulos
      this.loading.show();
      await this.yourService.saveModuleHours(this.moduleHours);
      this.loading.hide();
      this.toastService.showInfo(
        'Horarios de todos los módulos guardados correctamente'
      );
    } catch (error) {
      alert('Error al guardar los horarios de los módulos:' + error);
    }
  }

  toggleMorning(moduleName: string) {
    this.showMorning[moduleName] = !this.showMorning[moduleName];
  }

  toggleAfternoon(moduleName: string) {
    this.showAfternoon[moduleName] = !this.showAfternoon[moduleName];
  }

  isMorning(timeSlot: string): boolean {
    return this.getHour(timeSlot) < 15; // Antes de las 15:00 es mañana
  }

  isAfternoon(timeSlot: string): boolean {
    return this.getHour(timeSlot) >= 15; // Desde las 15:00 en adelante es tarde
  }

  private getHour(timeSlot: string): number {
    return parseInt(timeSlot.split(':')[0], 10);
  }
}
