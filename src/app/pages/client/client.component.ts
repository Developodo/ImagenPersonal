import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmdeletedialogComponent } from '../../components/confirmdeletedialog/confirmdeletedialog.component';
import { CommonModule } from '@angular/common';
import { StatusService } from '../../services/status.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Modules } from '../../data/modules';
import { MatSelectModule } from '@angular/material/select';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    MatSelectModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NavbarComponent,
    ReactiveFormsModule, FooterComponent
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css',
})
export class ClientComponent implements OnInit {
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  modules = Modules.modules;
  selectedModule = '';

  @ViewChild('imageDialog') imageDialog!: TemplateRef<any>;

  id = input.required();
  moduleName = input.required<string>();
  isNew = false;
  clientForm: FormGroup;
  statusS = inject(StatusService);

  clientData = signal<any>({
    name: '',
    surname: '',
    data: [],
  });

  firestoreS = inject(FirestoreService);
  router = inject(Router);
  formattedDate = '';

  editingIndex: number | null = null;
  editForm: FormGroup;

  loading = inject(LoadingService);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    const today = new Date();
    this.formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${today.getFullYear()} `;
    this.clientForm = this.fb.group({
      surname: ['', Validators.required],
      name: ['', Validators.required],
      data: [this.formattedDate + ' '],
    });
    this.editForm = this.fb.group({
      editedText: new FormControl(''),
    });
    this.clientForm.valueChanges.subscribe(() => {
      this.statusS.isChanged = true;
    });
    this.editForm.valueChanges.subscribe(() => {
      this.statusS.isChanged = true;
    });
    effect(
      async () => {
        if (this.id() == 'new') {
          this.isNew = true;
        } else {
          await this.loadData();
        }
      },
      { allowSignalWrites: true }
    );
  }
  ngOnInit(): void {
    if (!this.modules.some(module => module.name === this.moduleName())) {
      this.router.navigate(['/error']);
    }
    this.statusS.isChanged = false;
    this.selectedModule = this.moduleName();
  }

  async loadData() {
    this.loading.show();
    const data = await this.firestoreS.getClientById(this.id() as string); // Este método debe devolver los datos del cliente por ID
    this.loading.hide();
    if (!data) return;

    this.clientData.set(data);
    this.clientForm.setValue({
      name: data['name'],
      surname: data['surname'],
      data: this.formattedDate + ' ',
    });
    this.imagePreview = data['image-' + this.moduleName()];
    this.statusS.isChanged = false;
  }
  async saveClient() {
    if (!this.clientForm.valid) return;

    if (this.isNew) {
      let newClient: any = {
        name: this.clientForm.value.name,
        surname: this.clientForm.value.surname,
      };
      if (
        this.clientForm.value.data.trim() &&
        this.clientForm.value.data.trim() != this.formattedDate.trim()
      )
        newClient[this.moduleName()] = [this.clientForm.value.data];
      if (this.imagePreview)
        newClient['image-' + this.moduleName()] = this.imagePreview;

      try {
        this.statusS.isChanged = false;
        this.loading.show();
        await this.firestoreS.addClient(newClient);
        this.loading.hide();
      } catch (err) {
        alert(err);
        return;
      }
    } else {
      let udpatedClient = { ...this.clientData() };
      udpatedClient.name = this.clientForm.value.name;
      udpatedClient.surname = this.clientForm.value.surname;
      if (!udpatedClient[this.moduleName()])
        udpatedClient[this.moduleName()] = [];
      if (this.imagePreview)
        udpatedClient['image-' + this.moduleName()] = this.imagePreview;
      else{
        udpatedClient['image-' + this.moduleName()]=''
      }
      if (
        this.clientForm.value.data.trim() &&
        this.clientForm.value.data.trim() != this.formattedDate.trim()
      )
        udpatedClient[this.moduleName()].unshift(this.clientForm.value.data);
      this.statusS.isChanged = false;
      this.loading.show();
      await this.firestoreS.updateClient(this.id() as string, udpatedClient);
      this.loading.hide();
    }
    this.router.navigate(['/clients/' + this.moduleName()]); // Redirige al listado de clientes
  }

  navigateClients() {
    this.router.navigate(['/clients/' + this.moduleName()]); // Redirige al listado de clientes
  }

  openDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmdeletedialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result === 'confirm') {
        this.deleteClient();
      }
    });
  }

  async deleteClient() {
    const clientData = this.clientData(); // Usar los datos ya cargados del cliente

    // Verificar si el cliente tiene el módulo y eliminar el módulo específico
    if (clientData) {
      // Eliminar el módulo específico (campo correspondiente al módulo)
      if (clientData[this.moduleName()]) delete clientData[this.moduleName()];

      // Verificar si quedan otros módulos
      //const remainingModules = Object.keys(clientData).filter(key => key !== 'name' && key !== 'surname');
      const remainingModules = Object.keys(clientData).filter(
        (key) =>
          key !== 'name' &&
          key !== 'surname' &&
          Modules.modules.some((module) => module.name === key)
      );
      if (remainingModules.length > 0) {
        // Si aún quedan módulos, solo actualizar el cliente sin el módulo eliminado
        this.loading.show();
        await this.firestoreS.updateClient(this.id() as string, clientData);
        this.loading.hide();
        this.toastService.showInfo(
          'El cliente se mantiene en el sistema puesto que tiene datos en otros módulos, aunque toda la información de este módulo ha sido eliminada. Módulos en los que tiene info: ' +
            remainingModules.join(', '),
          7000
        );
      } else {
        // Si no quedan módulos, eliminar el cliente completo
        if(confirm("El cliente "+clientData['name']+" "+clientData['surname']+" será eliminado definitivamente del sistema. ¿Desea continuar?") && confirm("Esta operación no se puede deshacer, ¿desea continuar de todos modos?")){
          this.loading.show();
          await this.firestoreS.removeClient(this.id() as string);
          this.loading.hide();
        }
      }
    }

    // Redirigir después de la eliminación
    this.router.navigate(['/clients/' + this.moduleName()]);
  }

  editEntry(index: number, text: string) {
    this.editingIndex = index;
    this.editForm.setValue({ editedText: text });
  }

  saveEdit(index: number) {
    this.statusS.isChanged = true;
    const newText = this.editForm.value.editedText.trim();
    if (!newText) return;

    const updatedData = [...this.clientData()[this.moduleName()]];

    updatedData[index] = newText;

    this.clientData.update((data) => {
      console.log(data);
      data[this.moduleName()] = updatedData;
      return data;
    });

    this.editingIndex = null;
  }

  cancelEdit() {
    this.editingIndex = null;
  }

  async deleteEntry(index: number) {
    this.statusS.isChanged = true;
    this.clientData()[this.moduleName()].splice(index, 1);
    let updatedClient = { ...this.clientData() };
  }

  onFileSelected(event: Event) {
    console.log(event);
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      this.compressImage(file, 0.6, (compressedBase64) => {
        this.imagePreview = compressedBase64;
        // 🔄 Reseteamos el input para poder elegir la misma imagen de nuevo
        fileInput.value = '';
        this.statusS.isChanged = true;
      });
    }
  }

  deleteImage() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.statusS.isChanged = true;
  }

  viewImage() {
    this.dialog.open(this.imageDialog, {
      width: '90vw',
      maxWidth: '600px',
    });
  }

  compressImage(
    file: File,
    quality: number,
    callback: (base64: string) => void
  ) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const maxWidth = 800; // Limitar ancho máximo
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality); // Comprime

        callback(compressedBase64);
      };
    };
  }

  onModuleChange(module: any) {
    console.log(module);
    this.router.navigate(['/client/' + module + '/' + this.id()]);
  }
}
