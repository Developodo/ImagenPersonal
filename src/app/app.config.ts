import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment.development';
import { provideServiceWorker } from '@angular/service-worker';

import { importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,withComponentInputBinding()), provideAnimationsAsync(),

    { provide: 'LOCALE_ID', useValue: 'es-ES' },
    provideHttpClient(),
    importProvidersFrom(MatSnackBarModule), // Importa MatSnackBar correctamente
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ] 
};
