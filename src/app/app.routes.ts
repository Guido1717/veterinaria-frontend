import { Routes } from '@angular/router';

import { CrudPage } from './crud/crud-page';
import { ENTIDADES } from './core/entidades';
import { Shell } from './layout/shell';

/** Una ruta por entidad: cada módulo del menú es una pantalla propia. */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ENTIDADES[0].ruta },
      ...ENTIDADES.map((entidad) => ({
        path: entidad.ruta,
        component: CrudPage,
        data: { entidad },
        title: `${entidad.titulo} · Clínica Veterinaria`,
      })),
      { path: '**', redirectTo: ENTIDADES[0].ruta },
    ],
  },
];
