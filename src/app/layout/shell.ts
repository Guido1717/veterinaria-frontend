import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AvisosService } from '../core/avisos.service';
import { ENTIDADES } from '../core/entidades';
import { environment } from '../../environments/environment';

const CLAVE_PREFERENCIA = 'veterinaria.menu-retraido';

function leerPreferencia(): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE_PREFERENCIA);
    if (guardado !== null) return guardado === 'true';
  } catch {
    // Sin acceso a localStorage: se usa el valor por defecto.
  }
  // En pantallas angostas el menú arranca retraído.
  return window.matchMedia('(max-width: 720px)').matches;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly entidades = ENTIDADES;
  protected readonly avisos = inject(AvisosService);
  protected readonly apiUrl = environment.apiUrl.replace(/^https?:\/\//, '');
  protected readonly retraido = signal(leerPreferencia());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(CLAVE_PREFERENCIA, String(this.retraido()));
      } catch {
        // Ignorado: la preferencia solo dura la sesión.
      }
    });
  }

  protected alternarMenu(): void {
    this.retraido.update((valor) => !valor);
  }
}
