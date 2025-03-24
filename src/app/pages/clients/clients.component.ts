import { ChangeDetectorRef, Component, effect, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Modules } from '../../data/modules';
import { NgStyle } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { ExcelexportService } from '../../services/excelexport.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    NavbarComponent,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgStyle,
    FooterComponent,
    MatButtonModule,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
})
export class ClientsComponent {
  @ViewChild("searchInput",{static:true}) search!: ElementRef;
  moduleName = input.required();
  clients = signal<any[]>([]);
  firestoreService = inject(FirestoreService);
  searchTerm = signal<any>('');
  router = inject(Router);
  loading = inject(LoadingService);
  excel = inject(ExcelexportService);
  _written=false;
  nclients=0;

  ngOnInit() {
    // Recuperar el término de búsqueda de localStorage al cargar la página
    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
      // Si hay un término guardado, asignarlo al campo de búsqueda
      if(this.search.nativeElement){
          this.search.nativeElement.value=savedSearchTerm; 
          this.searchTerm.set({target:{
            value:savedSearchTerm}}); 
       // this.onSearchChange(savedSearchTerm);
      }
    }
  }
  

  


  constructor(private cdr: ChangeDetectorRef) {


    effect(
      () => {
        if (
          !this.moduleName() ||
          !Modules.modules.some((m) => m.name === this.moduleName())
        ) {
          this.router.navigate(['modules']);
          return;
        }
        this.loading.show();
        this.firestoreService.getClients().then((data: any) => {
          this.nclients=data.length;
          this.clients.set(data);
          this.loading.hide();
        });
      },
      { allowSignalWrites: true }
    );
  }

  get filteredClients() {
    const term = this.searchTerm().target?.value;
    const searchText =
      typeof term === 'string' ? term.trim().toLowerCase() : '';
      if (searchText) {
        this._written=true;
        localStorage.setItem('searchTerm', searchText);
      }else if(this._written){
        localStorage.removeItem('searchTerm');
      }
      
    if (!searchText) return this.clients();

    const result= this.clients().filter((client) => {
      const normalizedTerm = this.normalizeString(searchText);
      return (
        this.normalizeString(client.surname).includes(normalizedTerm) ||
        this.normalizeString(client.name).includes(normalizedTerm)
      );
    });
    setTimeout(()=>{
      this.nclients=result.length;
    },500)
    
    return result;
  }

  // Función para eliminar tildes y caracteres especiales
  private normalizeString(str: string): string {
    return str
      .normalize('NFD') // Descompone caracteres en base + tilde
      .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos
      .toLowerCase();
  }

  onSearchChange(search: any) {
    this.searchTerm.set(search); // Actualizamos el término de búsqueda
  }
  navigateToClient(clientId: string) {
    this.router.navigate([`client/${this.moduleName()}/${clientId}`]);
  }

  navigateToAddClient() {
    this.router.navigate(['/client/' + this.moduleName() + '/new']); // Esto asume que 'client' es la ruta para añadir un nuevo cliente
  }
  navigateToChooseModule() {
    this.router.navigate(['/modules']);
  }

  getModuleImage(): string {
    const module = Modules.modules.find((m) => m.name === this.moduleName());

    return module?.image || 'ruta_por_defecto.jpg';
  }

  getModuleColor(): string {
    const module = Modules.modules.find((m) => m.name === this.moduleName());
    return module?.color || '#007bff'; // Color por defecto si no se encuentra
  }
  exportData() {
    if (
      !confirm(
        '¿Deseas exportar todas las fichas de clientes a un archivo Excel?'
      )
    )
      return;
    const modules = Modules.modules; // Los nombres de los módulos

    const transformedData = this.clients().map((client) => {
      let modulesData: any = {};

      // Iteramos sobre los módulos
      modules.forEach((moduleKey: any) => {
        const m = moduleKey.name;
        if (client[m]) {
          // Si el cliente tiene datos para este módulo
          // Serializamos el objeto y lo asignamos a la columna correspondiente
          modulesData[m] = JSON.stringify(client[m]); // Serializamos correctamente
        } else {
          // Si el cliente no tiene datos para este módulo, dejamos el valor vacío
          modulesData[m] = '';
        }
      });

      return {
        Nombre: client.name,
        Apellidos: client.surname,
        ...modulesData, // Agregamos las columnas de módulos
      };
    });

    // Exportamos los datos transformados a Excel
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, '0')}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getFullYear()}`;

    // Usar la fecha formateada como sufijo en el nombre del archivo
    const fileName = `clientes-${formattedDate}`;

    // Exportar los datos a Excel
    this.excel.exportToExcel(transformedData, fileName);
  }
}
