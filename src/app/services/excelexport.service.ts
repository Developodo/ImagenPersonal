import { inject, Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GoogleService } from './google.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelexportService {
  //google = inject(GoogleService);

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${fileName}.xlsx`);

    this.uploadFileToGoogleDrive(blob, fileName);
  }
  private async uploadFileToGoogleDrive(file: Blob, fileName: string) {
    try {
      // Aquí convertimos el Blob a un archivo para poder subirlo
      const fileToUpload = new File([file], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Usamos el servicio de Google para subir el archivo
      //await this.google.uploadFile(fileToUpload);
     // console.log('Archivo subido correctamente a Google Drive');
    } catch (error) {
      console.error(error);
    }
  }
}
