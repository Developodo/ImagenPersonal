import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';

import { MatSelect, MatSelectModule } from '@angular/material/select';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular'; // para el calendario
import dayGridPlugin from '@fullcalendar/daygrid'; // para la vista de día
import interactionPlugin from '@fullcalendar/interaction'; // para la interactividad (clics, arrastres)
import esLocale from '@fullcalendar/core/locales/es'; // Importa el idioma español
import { NormalizesearchPipe } from '../../pipes/normalizesearch.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FirestoreService } from '../../services/firestore.service';
import { Modules } from '../../data/modules';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { EventDetailsModalComponent } from '../../components/event-details-modal/event-details-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    FullCalendarModule,
    MatFormField,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    NormalizesearchPipe,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    NavbarComponent,
    MatButtonModule, FooterComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  @ViewChild('modal') modal!: ElementRef;
  @ViewChild('calendar') calendarElement!: FullCalendarComponent;
  isZoomedIn: boolean = false; // Variable para controlar si estamos en vista de zoom
  currentMonth: any = undefined;
  @ViewChild('sclients') matSelect: MatSelect | undefined;
  firestore = inject(FirestoreService);
  selectedDate: string | null = null; // Para controlar la visibilidad del modal
  searchClient: string = ''; // Modelo para la búsqueda
  allEvents: any = [];
  filteredEvents: any = [];
  filterModule = '';
  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    locale: esLocale, // Configura el idioma a español
    editable: true,
    droppable: true,
    hiddenDays: [0, 6], // 0: Domingo, 6: Sábado, ocultamos el sábado y domingo
    weekends: false, // También oculta el fin de semana
    datesSet: this.onDatesSet.bind(this), // Manejador para cuando se cambia la vista
    eventTimeFormat: {
      // Formato para mostrar la hora completa en los eventos
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false, // No muestra AM/PM
      hour12: false, // Usa 24 horas
    },
    contentHeight: 'auto', // Para que la altura se ajuste automáticamente
    // Personalizar el contenido del evento
  };

  // Formulario reactivo para seleccionar el módulo y el cliente
  eventForm: FormGroup;
  loading = inject(LoadingService);

  modules = Modules.modules;
  clients = [''];
  availableHours: string[] = []; // Horas disponibles para el módulo y día seleccionados
  availableDays: string[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ]; // Días disponibles

  // Simulación de horas disponibles para cada módulo por día
  moduleHours: any = {};

  filteredClients = [...this.clients]; // Lista filtrada de clientes

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastService: ToastService,
    private renderer: Renderer2
  ) {
    localStorage.removeItem('searchTerm');
    //this.firestore.saveModuleHours(this.moduleHours)
    this.eventForm = this.fb.group({
      module: ['', Validators.required],
      client: ['', Validators.required],
      day: ['', Validators.required], // Día de la semana
      hour: ['', Validators.required], // Hora seleccionada
      searchClient: [''], // Agregar el control de búsqueda
    });
  }
  filterClients(): void {
    const search = this.eventForm?.get('searchClient')?.value.toLowerCase();

    // Normaliza y elimina acentos de la búsqueda
    const normalizedSearch = this.removeAccents(search);

    this.filteredClients = this.clients.filter((client) => {
      // Normaliza y elimina acentos del cliente
      const normalizedClient = this.removeAccents(client.toLowerCase());
      return normalizedClient.includes(normalizedSearch);
    });

    if (this.filteredClients.length > 0 && this.matSelect) {
      this.matSelect.open(); // Opens the mat-select programmatically
    }
  }
  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  async deleteEvent(eventId: string) {
    await this.firestore.deleteEvent(eventId);
  }

  ngAfterViewInit() {
    // Detectar el historial del navegador
    window.onpopstate = (event) => {
      if (this.isZoomedIn) {
        this.backToMonthView(); // Si se navega hacia atrás, volvemos al mes
      }
    };
  }
  async loadModuleHours() {
    try {
      // Cargar los datos desde el servicio
      this.loading.show();
      this.moduleHours = await this.firestore.getModuleHours();
      this.loading.hide();
    } catch (error) {
      console.error('Error al cargar los horarios de módulos:', error);
    }
  }
  async loadClients() {
    try {
      // Llamar al servicio para obtener todos los clientes
      this.loading.show();
      const allClients = await this.firestore.getClients();
      this.loading.hide();

      // Filtrar solo los campos 'surname' y 'name'
      this.clients = allClients.map(
        (client) => client.surname + ', ' + client.name
      );
      this.filteredClients = [...this.clients];
    } catch (error) {
      console.error('Error al cargar los clientes:', error);
    }
  }
  ngOnInit(): void {
    // Obtener el mes actual en formato YYYY-MM
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Cargar eventos del mes actual
    this.loadEvents(currentMonth);
    this.loadClients();
    this.loadModuleHours();
  }

  onDatesSet(eventData: any) {
    // Convertimos la fecha a UTC para evitar el problema de la zona horaria
    const date = new Date(
      Date.UTC(
        eventData.view.currentStart.getFullYear(),
        eventData.view.currentStart.getMonth(), // Usa el mes exacto
        1 // Día 1, ya que solo nos interesa el mes
      )
    );

    // Formateamos la fecha en 'YYYY-MM' (mes actual)
    const currentMonth = date.toISOString().split('T')[0].slice(0, 7);
    this.loadEvents(currentMonth); // Carga eventos para el mes actual visible
  }

  loadEvents(currentMonth: string) {
    if (this.isZoomedIn) {
      this.createEventCircle();
      return;
    }
    if (this.currentMonth && this.currentMonth == currentMonth) return;
    this.currentMonth = currentMonth;

    if (currentMonth) {
      this.loading.show();
      this.firestore
        .getEventsByMonth(currentMonth)
        .then((events) => {
          this.allEvents = events;
          this.onModuleChangeFilter(this.filterModule);
          this.loading.hide();
        })
        .catch((error) => {
          console.error('Error al cargar los eventos:', error);
        });
    }
  }

  handleDateClick(arg: any) {
    if (
      arg.jsEvent.target.className == 'fc-daygrid-day-events' &&
      arg.jsEvent.target.dataset.eventCount &&
      arg.jsEvent.target.dataset.eventCount > 0
    ) {
      arg.jsEvent.target.click();
      return;
    }
    // Mostrar formulario para seleccionar módulo y cliente
    this.eventForm.controls['day'].enable();
    this.eventForm.reset(); // Limpiar formulario
    arg.jsEvent.stopPropagation();
    this.openModal(arg);
    // Seleccionamos el día automáticamente basado en la fecha
    const dayOfWeek = this.getDayOfWeek(arg.date);
    this.eventForm.patchValue({
      day: this.availableDays[dayOfWeek - 1], // Asignamos el día de la semana
    });

    this.eventForm.controls['day'].disable();
  }

  getDayOfWeek(date: string): number {
    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const dateObj = new Date(date);
    return dateObj.getDay(); // Devuelve el índice del día de la semana
  }
  onModuleChange(module: any) {
    const selectedDay = this.eventForm.controls['day'];
    if (selectedDay) {
      this.availableHours =
        this.moduleHours[module][selectedDay.value as any] || [];
    }
  }
  onModuleChangeFilter(module: string) {
    if (this.filterModule && module === this.filterModule) return;

    this.filterModule = module;
    if (module) {
      this.filteredEvents = this.allEvents.filter((event: any) => {
        return event.module === module;
      });
    } else {
      this.filteredEvents = [...this.allEvents]; // Si se selecciona "Todos", mostrar todos los eventos
    }

    this.calendarOptions.events = this.filteredEvents; // Actualiza los eventos mostrados en el calendario
    this.createEventCircle();
  }

  createEventCircle() {
    setTimeout(() => {
      const dayGridEventContainers = document.querySelectorAll(
        '.fc-daygrid-day-events'
      );

      dayGridEventContainers.forEach((container) => {
        container.removeAttribute('data-event-count');

        const eventCount = container.querySelectorAll(
          '.fc-daygrid-event-harness'
        ).length;
        if (eventCount > 0) {
          const dateElement = container.parentElement?.querySelector(
            '.fc-daygrid-day-number'
          );
          const date = dateElement?.getAttribute('aria-label');

          (container as HTMLElement).addEventListener('click', () => {
            if (!this.isZoomedIn && date) {
              const calendarApi = this.calendarElement.getApi();
              const _date = this.parseSpanishDate(date);
              calendarApi.zoomTo(_date);
              this.isZoomedIn = true;
              this.showEvents();
              history.pushState({ zoomedIn: true }, 'Zoom View');
              return;
            }
          });
          container.setAttribute('data-event-count', eventCount.toString()); // Establece el número de eventos como un atributo

          //(container as HTMLElement).click()
        }
      });
    }, 50);
  }
  parseSpanishDate(dateString: any) {
    const months: any = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    };

    const parts = dateString.toLowerCase().split(' de ');
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);

    // Crear fecha en UTC para evitar desfases de zona horaria
    return new Date(Date.UTC(year, month, day));
  }
  onDayChange(day: string) {
    /* const selectedModule = this.eventForm.value.module;
    if (selectedModule) {
      this.availableHours = this.moduleHours[selectedModule][day] || [];
    }*/
  }
  backToMonthView() {
    // Cambiar a la vista de mes
    this.calendarElement.getApi().changeView('dayGridMonth');
    this.isZoomedIn = false; // Desactivar el estado de zoom
    this.showEvents(false);
    history.back();
  }
  async handleEventClick(arg: any) {
    const dialogRef = this.dialog.open(EventDetailsModalComponent, {
      width: '80%',
      data: { event: arg.event },
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result?.delete) {
      if (!confirm('¿Desea eliminar la cita ' + arg.event.title + ' ?')) return;
      await this.deleteEvent(arg.event.id);
      this.allEvents = this.allEvents.filter(
        (event: any) => event.id !== arg.event.id
      );
      arg.event.remove();

      this.createEventCircle();
    }
  }

  // Método para abrir el modal y seleccionar la fecha
  openModal(date: any) {
    history.pushState(null, '', location.href); // Agregar estado al historial

    this.selectedDate = date.dateStr;
  }

  // Método para cerrar el modal
  closeModal() {
    history.pushState(null, '', location.href); // Evitar que el navegador retroceda

    this.selectedDate = null; // Esto oculta el modal
  }

  // Cerrar el modal cuando se presiona la tecla Escape
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    this.closeModal();
  }
  @HostListener('window:popstate', ['$event'])
  onBackButton(event: PopStateEvent) {
    event.preventDefault();
    this.closeModal();
  }

  // Método para el botón de "Cancelar"
  cancel() {
    this.closeModal();
  }

  // Guardar el evento después de seleccionar el módulo y cliente
  // Guardar el evento después de seleccionar el módulo, cliente, día y hora
  saveEvent() {
    if (this.eventForm.valid && this.selectedDate) {
      const selectedModule = this.eventForm.value.module;
      const selectedClient = this.eventForm.value.client;
      const selectedDay = this.eventForm.value.day;
      const selectedHour = this.eventForm.value.hour;

      // Obtener el color del módulo seleccionado, si no tiene un color asignado, usa un color por defecto
      const moduleColor =
        this.modules.find((m) => m.name === selectedModule)?.color || '#007bff'; // Color por defecto (azul)

      const newEvent = {
        title: `${selectedModule} - ${selectedClient} - ${selectedHour}`, // El título del evento será el módulo y cliente seleccionados
        start: `${this.selectedDate}T${selectedHour}:00`, // Fecha y hora seleccionada
        end: `${this.selectedDate}T${selectedHour}:00`, // Aquí puedes definir la duración si es necesario
        module: selectedModule, // Módulo seleccionado
        client: selectedClient, // Cliente seleccionado
        editable: false, // Permite editar el evento
        droppable: false, // Permite mover el evento
        backgroundColor: moduleColor, // Asignar color al evento
        borderColor: moduleColor, // Asignar color al borde del evento
      };

      // Aquí puedes guardar el evento en Firestore (o en otro lugar)
      // this.firestoreService.addEvent(newEvent);
      this.loading.show();
      this.firestore
        .addEvent(newEvent)
        .then((e) => {
          this.loading.hide();
          this.allEvents = [...this.allEvents, e];
          this.onModuleChangeFilter(this.filterModule);
          // alert('Evento guardado: ' + e.title);
          this.selectedDate = null;
        })
        .catch((error) => {
          console.error('Error al guardar el evento: ', error);
        });
      // Agregar el evento al calendario
    } else {
      this.toastService.showInfo(
        'Por favor, selecciona el módulo, cliente, día y hora'
      );
    }
  }

  showEvents(v = true) {
    const eventContainers = document.querySelectorAll(
      '.fc-daygrid-event-harness'
    );

    // Itera sobre los contenedores de eventos
    eventContainers.forEach((container: Element) => {
      // Modifica las clases o estilos de los eventos
      if (v) (container as HTMLElement).classList.add('show');
      else (container as HTMLElement).classList.remove('show');
    });
  }
}
