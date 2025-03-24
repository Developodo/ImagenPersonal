import { inject, Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  DocumentData,
  Firestore,
  getDocs,
  where,
  query,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  queryEqual,
  setDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  async getClients(): Promise<any[]> {
    // Correcta referencia a la colección "clients"
    const clientsCollectionRef: any = collection(this.firestore, 'clients'); // Aquí pasamos el nombre como string
    //const q = query(clientsCollectionRef, where('module', '==', moduleName)); // Utilizamos la referencia para hacer la consulta
    const q = query(
      clientsCollectionRef,
      orderBy('surname'), // Ordena por apellido
      orderBy('name')
    ); // Luego ordena por nombre);
    const querySnapshot = await getDocs(q);

    const clients: any[] = [];
    querySnapshot.forEach((doc: any) => {
      clients.push({ id: doc.id, ...doc.data() }); // Añadir el ID
    });

    return clients;
  }
  async getClientById(id: string) {
    const docRef = doc(this.firestore, `clients/${id}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async addClient(clientData: any) {
    clientData.name = this.capitalizeFirstLetter(clientData.name);
    clientData.surname = this.capitalizeFirstLetter(clientData.surname);
    const clientsRef = collection(this.firestore, 'clients');

    // Normalizar texto: quitar tildes y pasar a minúsculas
    const normalizeText = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const normalizedSurname = normalizeText(clientData.surname);
    const normalizedName = normalizeText(clientData.name);

    // Buscar si ya existe un cliente con el mismo nombre y apellido
    const q = query(
      clientsRef,
      where('surname', '==', clientData.surname),
      where('name', '==', clientData.name)
    );

    const querySnapshot = await getDocs(q);

    // Revisar coincidencias sin importar mayúsculas, minúsculas o tildes
    const exists = querySnapshot.docs.some((doc) => {
      const existingData: any = doc.data();
      return (
        normalizeText(existingData.surname) === normalizedSurname &&
        normalizeText(existingData.name) === normalizedName
      );
    });

    if (exists) {
      throw new Error('Este cliente ya existe en la base de datos.');
    }

    // Si no existe, agregar el cliente
    await addDoc(clientsRef, clientData);
  }

  async updateClient(id: string, clientData: any) {
    const docRef = doc(this.firestore, `clients/${id}`);
    await updateDoc(docRef, clientData);
  }
  async removeClient(clientId: string) {
    try {
      const clientDocRef = doc(this.firestore, 'clients', clientId);
      await deleteDoc(clientDocRef);
      console.log(`Cliente con ID ${clientId} eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      throw new Error('No se pudo eliminar el cliente.');
    }
  }
  capitalizeFirstLetter(str: any) {
    return str
      .toLowerCase() // Convierte toda la cadena a minúsculas
      .replace(/^\w/, (c: any) => c.toUpperCase()) // Capitaliza la primera letra de la cadena
      .replace(/\s+\w/g, (match: any) => match.toUpperCase()); // Capitaliza las letras después de los espacios
  }

  async getEventsByMonth(month: string): Promise<any[]> {
    const eventsCollectionRef = collection(this.firestore, 'events');

    // Filtrar por mes, asumiendo que 'start' está almacenado como una cadena ISO 8601
    const startOfMonth = `${month}-01T00:00:00`; // Fecha de inicio del mes (primer día a las 00:00:00)
    const endOfMonth = new Date(`${month}-01T00:00:00`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Sumar 1 mes
    endOfMonth.setDate(0); // Establecer el último día del mes actual
    endOfMonth.setHours(23, 59, 59, 999); // Asegurarse de que la hora sea el último momento del día
    const endOfMonthString = endOfMonth.toISOString(); // Convertir a cadena en formato ISO

    const q = query(
      eventsCollectionRef,
      where('start', '>=', startOfMonth),
      where('start', '<', endOfMonthString),
      orderBy('start')
    );

    const querySnapshot = await getDocs(q);

    const events: any[] = [];
    querySnapshot.forEach((doc: any) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    return events;
  }

  // Agregar un evento
  async addEvent(eventData: any) {
    const eventsRef = collection(this.firestore, 'events');
    const docRef: DocumentReference = await addDoc(eventsRef, eventData);
    // Agregar el evento a Firestore

    return { id: docRef.id, ...eventData };
  }
  async deleteEvent(eventId: string) {
    // Aquí puedes manejar la eliminación del evento de tu base de datos
    console.log(`Borrar evento con ID: ${eventId}`);

    // Supongamos que estás utilizando Firestore, se eliminaría el evento así:
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    deleteDoc(eventDocRef)
      .then(() => {
        console.log('Evento eliminado correctamente');
      })
      .catch((error) => {
        console.error('Error al eliminar el evento:', error);
      });
  }

  async getModuleHours(): Promise<any> {
    const moduleHoursRef = collection(this.firestore, 'moduleHours'); // Referencia a la colección 'moduleHours'

    const querySnapshot = await getDocs(moduleHoursRef);

    const moduleHoursData: any = {};

    querySnapshot.forEach((doc) => {
      moduleHoursData[doc.id] = doc.data(); // Obtiene los horarios por módulo
    });
    return moduleHoursData;
  }

  async saveModuleHours(moduleHours: any): Promise<void> {
    try {
      // Iteramos sobre cada módulo
      for (const [moduleName, hours] of Object.entries(moduleHours)) {
        const moduleRef = doc(
          collection(this.firestore, 'moduleHours'),
          moduleName
        ); // Referencia al documento del módulo

        // Guardamos el horario en Firestore
        await setDoc(moduleRef, hours);
      }
    } catch (error) {
      console.error('Error al guardar los horarios:', error);
    }
  }

  async getEventsByCourse(course: string) {
    const eventsRef = collection(this.firestore, 'events');

    // Descomponer el curso en el año inicial y final (Ej. "24/25")
    const startYear = course.split('/')[0];
    const endYear = course.split('/')[1];

    // Formatear correctamente las fechas en formato ISO (YYYY-MM-DDTHH:mm:ss)
    const startDate = `${startYear}-09-01T00:00:00`;
    const endDate = `${endYear}-06-30T23:59:59`;

    console.log(`Buscando eventos entre ${startDate} y ${endDate}`);

    // Consulta para obtener eventos entre esas fechas
    const q = query(
      eventsRef,
      where('start', '>=', startDate),
      where('start', '<=', endDate)
    );
    const snapshot = await getDocs(q);

    console.log(`Eventos encontrados: ${snapshot.size}`);

    let stats: { [module: string]: { month: string }[] } = {};

    snapshot.forEach((doc) => {
      const event: any = doc.data();
      console.log('Evento leído:', event); // 🔍 DEBUG

      if (!event.start) return; // Evita errores si falta la fecha

      const eventMonth = event.start.slice(5, 7); // Extraer el mes del evento
      if (!stats[event.module]) {
        stats[event.module] = [];
      }
      stats[event.module].push({ month: eventMonth });
    });

    console.log('Resultados procesados:', stats);

    return Object.keys(stats).map((module) => ({
      name: module,
      value: stats[module].length, // Total citas por módulo
      details: stats[module], // Lista de eventos con mes
    }));
  }
}
