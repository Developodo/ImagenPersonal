import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment.development';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private CLIENT_ID = environment.googleAPi.clientId;
  private API_KEY = environment.googleAPi.apiKey;
  private SCOPES = 'https://www.googleapis.com/auth/drive.file';

  constructor() {
    this.initGoogleAPI();
  }

  private initGoogleAPI() {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: this.API_KEY,
          clientId: this.CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: this.SCOPES
        });
        const GoogleAuth = gapi.auth2.getAuthInstance();
        // Iniciar sesión
        await GoogleAuth.signIn();
         console.log('Usuario autenticado');
      } catch (error) {
        console.error('Error initializing Google API:', error);
      }
    });
  }

  async signIn() {
    try {
      const GoogleAuth = gapi.auth2.getAuthInstance();
      const user = await GoogleAuth.signIn();
      console.log('Usuario autenticado:', user.getBasicProfile().getEmail());
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
    }
  }

  async uploadFile(file: File) {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const accessToken = gapi.auth.getToken().access_token;
      const metadata = {
        name: file.name,
        mimeType: file.type
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form
      });

      const data = await response.json();
      console.log('Archivo subido:', data);
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  }
}

