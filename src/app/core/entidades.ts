import { formatearFecha, recortar } from './formato';
import { Registro } from './modelos';

export type ClaveEntidad =
  | 'especies'
  | 'duenos'
  | 'mascotas'
  | 'veterinarios'
  | 'citas'
  | 'consultas'
  | 'vacunas'
  | 'tratamientos';

export type TipoCampo = 'texto' | 'texto-largo' | 'telefono' | 'numero' | 'fecha' | 'opciones' | 'relacion';

export interface Campo {
  /** Nombre exacto del campo en la API. */
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido?: boolean;
  /** Largo máximo (textos) según el schema del backend. */
  max?: number;
  /** Valor mínimo (números) según el schema del backend. */
  min?: number;
  /** Valores permitidos para el tipo 'opciones'. */
  opciones?: readonly string[];
  porDefecto?: unknown;
  /** Entidad a la que apunta un campo de tipo 'relacion' (llave foránea). */
  relacion?: ClaveEntidad;
  /** El backend no permite cambiarlo con PUT. */
  soloAlCrear?: boolean;
  /** Unidad que acompaña al valor en la tabla: [singular, plural], p. ej. ['año', 'años']. */
  sufijo?: readonly [string, string];
  ayuda?: string;
}

export interface Entidad {
  clave: ClaveEntidad;
  /** Ruta de Angular. */
  ruta: string;
  /** Recurso HTTP de la API: /recurso/ y /recurso/{id}. */
  recurso: string;
  titulo: string;
  singular: string;
  genero: 'f' | 'm';
  icono: string;
  descripcion: string;
  campos: readonly Campo[];
  /** Cómo se nombra un registro cuando otra entidad lo referencia. */
  etiqueta: (registro: Registro) => string;
}

export const ENTIDADES: readonly Entidad[] = [
  {
    clave: 'especies',
    ruta: 'especies',
    recurso: 'especies',
    titulo: 'Especies',
    singular: 'Especie',
    genero: 'f',
    icono: 'category',
    descripcion: 'Tipos de animales que atiende la clínica.',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 50 },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'texto-largo', max: 200 },
    ],
    etiqueta: (r) => String(r['nombre']),
  },
  {
    clave: 'duenos',
    ruta: 'duenos',
    recurso: 'duenos',
    titulo: 'Dueños',
    singular: 'Dueño',
    genero: 'm',
    icono: 'group',
    descripcion: 'Personas responsables de cada mascota.',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true, max: 100 },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono', requerido: true, max: 20 },
      { nombre: 'direccion', etiqueta: 'Dirección', tipo: 'texto', max: 200 },
    ],
    etiqueta: (r) => String(r['nombre']),
  },
  {
    clave: 'mascotas',
    ruta: 'mascotas',
    recurso: 'mascotas',
    titulo: 'Mascotas',
    singular: 'Mascota',
    genero: 'f',
    icono: 'pets',
    descripcion: 'Pacientes registrados, con su especie y su dueño.',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, max: 50 },
      { nombre: 'edad', etiqueta: 'Edad', tipo: 'numero', requerido: true, min: 0, sufijo: ['año', 'años'] },
      { nombre: 'especie_id', etiqueta: 'Especie', tipo: 'relacion', relacion: 'especies', requerido: true },
      { nombre: 'dueno_id', etiqueta: 'Dueño', tipo: 'relacion', relacion: 'duenos', requerido: true },
    ],
    etiqueta: (r) => String(r['nombre']),
  },
  {
    clave: 'veterinarios',
    ruta: 'veterinarios',
    recurso: 'veterinarios',
    titulo: 'Veterinarios',
    singular: 'Veterinario',
    genero: 'm',
    icono: 'stethoscope',
    descripcion: 'Profesionales que atienden las citas.',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true, max: 100 },
      { nombre: 'especialidad', etiqueta: 'Especialidad', tipo: 'texto', requerido: true, max: 100 },
      { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'telefono', requerido: true, max: 20 },
    ],
    etiqueta: (r) => String(r['nombre']),
  },
  {
    clave: 'citas',
    ruta: 'citas',
    recurso: 'citas',
    titulo: 'Citas',
    singular: 'Cita',
    genero: 'f',
    icono: 'event',
    descripcion: 'Agenda de atención por mascota y veterinario.',
    campos: [
      { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', requerido: true },
      {
        nombre: 'estado',
        etiqueta: 'Estado',
        tipo: 'opciones',
        opciones: ['pendiente', 'atendida', 'cancelada'],
        porDefecto: 'pendiente',
        requerido: true,
      },
      { nombre: 'mascota_id', etiqueta: 'Mascota', tipo: 'relacion', relacion: 'mascotas', requerido: true },
      {
        nombre: 'veterinario_id',
        etiqueta: 'Veterinario',
        tipo: 'relacion',
        relacion: 'veterinarios',
        requerido: true,
      },
    ],
    etiqueta: (r) => `Cita #${r.id} · ${formatearFecha(r['fecha'])}`,
  },
  {
    clave: 'consultas',
    ruta: 'consultas',
    recurso: 'consultas',
    titulo: 'Consultas',
    singular: 'Consulta',
    genero: 'f',
    icono: 'clinical_notes',
    descripcion: 'Diagnóstico de cada cita. Al registrarla, la cita queda como atendida.',
    campos: [
      {
        nombre: 'cita_id',
        etiqueta: 'Cita',
        tipo: 'relacion',
        relacion: 'citas',
        requerido: true,
        soloAlCrear: true,
        ayuda: 'Cada cita admite una sola consulta. No se puede cambiar después.',
      },
      { nombre: 'diagnostico', etiqueta: 'Diagnóstico', tipo: 'texto-largo', requerido: true, max: 300 },
      { nombre: 'observaciones', etiqueta: 'Observaciones', tipo: 'texto-largo', max: 300 },
    ],
    etiqueta: (r) => `Consulta #${r.id} · ${recortar(r['diagnostico'], 28)}`,
  },
  {
    clave: 'vacunas',
    ruta: 'vacunas',
    recurso: 'vacunas',
    titulo: 'Vacunas',
    singular: 'Vacuna',
    genero: 'f',
    icono: 'vaccines',
    descripcion: 'Historial de vacunación de las mascotas.',
    campos: [
      { nombre: 'nombre', etiqueta: 'Vacuna', tipo: 'texto', requerido: true, max: 100 },
      { nombre: 'fecha_aplicacion', etiqueta: 'Fecha de aplicación', tipo: 'fecha', requerido: true },
      { nombre: 'mascota_id', etiqueta: 'Mascota', tipo: 'relacion', relacion: 'mascotas', requerido: true },
    ],
    etiqueta: (r) => String(r['nombre']),
  },
  {
    clave: 'tratamientos',
    ruta: 'tratamientos',
    recurso: 'tratamientos',
    titulo: 'Tratamientos',
    singular: 'Tratamiento',
    genero: 'm',
    icono: 'medication',
    descripcion: 'Medicamentos indicados en cada consulta.',
    campos: [
      { nombre: 'medicamento', etiqueta: 'Medicamento', tipo: 'texto', requerido: true, max: 100 },
      {
        nombre: 'duracion_dias',
        etiqueta: 'Duración',
        tipo: 'numero',
        requerido: true,
        min: 1,
        sufijo: ['día', 'días'],
      },
      { nombre: 'consulta_id', etiqueta: 'Consulta', tipo: 'relacion', relacion: 'consultas', requerido: true },
    ],
    etiqueta: (r) => String(r['medicamento']),
  },
];

export const ENTIDAD_POR_CLAVE = Object.fromEntries(ENTIDADES.map((e) => [e.clave, e])) as Record<
  ClaveEntidad,
  Entidad
>;
