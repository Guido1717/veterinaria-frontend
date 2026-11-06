import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'exito' | 'error';
  texto: string;
}

const DURACION_MS = 5000;

/** Mensajes flotantes que confirman cada operación o explican un error. */
@Injectable({ providedIn: 'root' })
export class AvisosService {
  private siguienteId = 0;
  readonly avisos = signal<Aviso[]>([]);

  exito(texto: string): void {
    this.agregar('exito', texto);
  }

  error(texto: string): void {
    this.agregar('error', texto);
  }

  cerrar(id: number): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private agregar(tipo: Aviso['tipo'], texto: string): void {
    const id = ++this.siguienteId;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), DURACION_MS);
  }
}
