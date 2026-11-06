/**
 * Modelos de lectura de la API (schemas *Read del backend).
 * Todos los ids son enteros asignados por la base de datos.
 */

export interface Especie {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Dueno {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string | null;
}

export interface Mascota {
  id: number;
  nombre: string;
  edad: number;
  especie_id: number;
  dueno_id: number;
}

export interface Veterinario {
  id: number;
  nombre: string;
  especialidad: string;
  telefono: string;
}

export type EstadoCita = 'pendiente' | 'atendida' | 'cancelada';

export interface Cita {
  id: number;
  fecha: string; // YYYY-MM-DD
  estado: EstadoCita;
  mascota_id: number;
  veterinario_id: number;
}

export interface Consulta {
  id: number;
  diagnostico: string;
  observaciones: string | null;
  cita_id: number;
}

export interface Vacuna {
  id: number;
  nombre: string;
  fecha_aplicacion: string; // YYYY-MM-DD
  mascota_id: number;
}

export interface Tratamiento {
  id: number;
  medicamento: string;
  duracion_dias: number;
  consulta_id: number;
}

/** Forma genérica de cualquier registro que devuelve la API. */
export type Registro = { id: number } & Record<string, unknown>;
