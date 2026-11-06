import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../core/api.service';
import { AvisosService } from '../core/avisos.service';
import { Campo, ClaveEntidad, Entidad, ENTIDAD_POR_CLAVE } from '../core/entidades';
import { mensajeDeError } from '../core/errores';
import { formatearFecha } from '../core/formato';
import { Registro } from '../core/modelos';

type Modo = 'crear' | 'editar' | 'ver';

interface Panel {
  modo: Modo;
  registro: Registro | null;
}

/**
 * Pantalla CRUD de una entidad. La entidad llega en los datos de la ruta,
 * así cada módulo del menú es una ruta propia con su configuración.
 */
@Component({
  selector: 'app-crud-page',
  imports: [FormsModule],
  templateUrl: './crud-page.html',
})
export class CrudPage {
  private readonly api = inject(ApiService);
  private readonly avisos = inject(AvisosService);

  protected readonly entidad: Entidad = inject(ActivatedRoute).snapshot.data['entidad'];

  protected readonly registros = signal<Registro[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly relaciones = signal<Partial<Record<ClaveEntidad, Registro[]>>>({});
  protected readonly panel = signal<Panel | null>(null);
  protected readonly ocupado = signal(false);
  protected readonly porEliminar = signal<Registro | null>(null);

  /** Valores del formulario (crear o editar). */
  protected valores: Record<string, unknown> = {};
  protected idBuscado: number | null = null;

  protected readonly camposFormulario = computed(() =>
    this.panel()?.modo === 'editar' ? this.entidad.campos.filter((c) => !c.soloAlCrear) : this.entidad.campos,
  );

  protected readonly tituloPanel = computed(() => {
    const panel = this.panel();
    if (!panel) return '';
    const { singular, genero } = this.entidad;
    if (panel.modo === 'crear') return `${genero === 'f' ? 'Nueva' : 'Nuevo'} ${singular.toLowerCase()}`;
    const id = panel.registro?.id;
    return panel.modo === 'editar' ? `Editar ${singular.toLowerCase()} #${id}` : `${singular} #${id}`;
  });

  constructor() {
    this.cargar();
    this.cargarRelaciones();
  }

  // ---- GET de la colección -------------------------------------------------

  protected cargar(): void {
    this.cargando.set(true);
    this.api.listar(this.entidad.recurso).subscribe({
      next: (lista) => {
        this.registros.set(lista);
        this.errorCarga.set(null);
        this.cargando.set(false);
      },
      error: (error) => {
        this.errorCarga.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  /** Carga las entidades relacionadas para mostrar nombres y llenar los selectores. */
  private cargarRelaciones(): void {
    const claves = new Set(
      this.entidad.campos.map((c) => c.relacion).filter((c): c is ClaveEntidad => c !== undefined),
    );
    for (const clave of claves) {
      this.api.listar(ENTIDAD_POR_CLAVE[clave].recurso).subscribe({
        next: (lista) => this.relaciones.update((actual) => ({ ...actual, [clave]: lista })),
        error: (error) => this.avisos.error(mensajeDeError(error)),
      });
    }
  }

  // ---- GET por id ----------------------------------------------------------

  protected buscarPorId(): void {
    if (!this.idBuscado || this.idBuscado < 1) {
      this.avisos.error('Escribe un id válido (número entero mayor que 0).');
      return;
    }
    this.ver(this.idBuscado);
  }

  protected ver(id: number): void {
    this.consultar(id, (registro) => this.panel.set({ modo: 'ver', registro }));
  }

  protected editar(id: number): void {
    this.consultar(id, (registro) => {
      this.valores = Object.fromEntries(this.entidad.campos.map((c) => [c.nombre, registro[c.nombre]]));
      this.panel.set({ modo: 'editar', registro });
    });
  }

  private consultar(id: number, alObtener: (registro: Registro) => void): void {
    this.ocupado.set(true);
    this.api.obtener(this.entidad.recurso, id).subscribe({
      next: (registro) => {
        this.ocupado.set(false);
        alObtener(registro);
      },
      error: (error) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(error));
      },
    });
  }

  // ---- POST y PUT ----------------------------------------------------------

  protected abrirCrear(): void {
    this.valores = Object.fromEntries(this.entidad.campos.map((c) => [c.nombre, c.porDefecto ?? null]));
    this.panel.set({ modo: 'crear', registro: null });
  }

  protected guardar(formulario: NgForm): void {
    const panel = this.panel();
    if (!panel || panel.modo === 'ver') return;
    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      this.avisos.error('Hay campos obligatorios vacíos o con valores no válidos.');
      return;
    }

    const datos = this.construirDatos();
    const peticion =
      panel.modo === 'crear'
        ? this.api.crear(this.entidad.recurso, datos)
        : this.api.actualizar(this.entidad.recurso, panel.registro!.id, datos);

    this.ocupado.set(true);
    peticion.subscribe({
      next: (registro) => {
        this.ocupado.set(false);
        this.panel.set(null);
        const accion = panel.modo === 'crear' ? 'cread' : 'actualizad';
        this.avisos.exito(`${this.entidad.singular} #${registro.id} ${accion}${this.terminacion()}.`);
        this.cargar();
      },
      error: (error) => {
        this.ocupado.set(false);
        this.avisos.error(mensajeDeError(error));
      },
    });
  }

  /** Solo envía los campos del formulario; los textos opcionales vacíos van como "". */
  private construirDatos(): Record<string, unknown> {
    const datos: Record<string, unknown> = {};
    for (const campo of this.camposFormulario()) {
      let valor = this.valores[campo.nombre];
      if (typeof valor === 'string') valor = valor.trim();
      if (valor === null || valor === undefined || valor === '') {
        if (campo.tipo === 'texto' || campo.tipo === 'texto-largo' || campo.tipo === 'telefono') {
          datos[campo.nombre] = '';
        }
        continue;
      }
      datos[campo.nombre] = valor;
    }
    return datos;
  }

  // ---- DELETE --------------------------------------------------------------

  protected pedirConfirmacion(registro: Registro): void {
    this.porEliminar.set(registro);
  }

  protected eliminar(): void {
    const registro = this.porEliminar();
    if (!registro) return;
    this.ocupado.set(true);
    this.api.eliminar(this.entidad.recurso, registro.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.porEliminar.set(null);
        this.avisos.exito(`${this.entidad.singular} #${registro.id} eliminad${this.terminacion()}.`);
        this.cargar();
      },
      error: (error) => {
        this.ocupado.set(false);
        this.porEliminar.set(null);
        this.avisos.error(mensajeDeError(error));
      },
    });
  }

  // ---- Presentación --------------------------------------------------------

  protected cerrarPanel(): void {
    if (!this.ocupado()) this.panel.set(null);
  }

  protected opcionesDe(campo: Campo): Registro[] {
    return campo.relacion ? (this.relaciones()[campo.relacion] ?? []) : [];
  }

  protected etiquetaDe(campo: Campo, registro: Registro): string {
    return ENTIDAD_POR_CLAVE[campo.relacion!].etiqueta(registro);
  }

  protected mostrar(registro: Registro, campo: Campo): string {
    const valor = registro[campo.nombre];
    if (valor === null || valor === undefined || valor === '') return '—';
    if (campo.tipo === 'relacion') {
      const relacionado = this.opcionesDe(campo).find((r) => r.id === valor);
      return relacionado ? this.etiquetaDe(campo, relacionado) : `#${valor}`;
    }
    if (campo.tipo === 'fecha') return formatearFecha(valor);
    if (campo.sufijo) {
      const [singular, plural] = campo.sufijo;
      return `${valor} ${valor === 1 ? singular : plural}`;
    }
    return String(valor);
  }

  protected nombreDe(registro: Registro): string {
    return this.entidad.etiqueta(registro);
  }

  private terminacion(): string {
    return this.entidad.genero === 'f' ? 'a' : 'o';
  }
}
