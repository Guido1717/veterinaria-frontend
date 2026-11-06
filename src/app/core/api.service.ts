import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Registro } from './modelos';

/**
 * Las cinco operaciones de la API para cualquier recurso.
 * La colección se llama con barra final: GET/POST /recurso/
 * Un registro va sin ella: GET/PUT/DELETE /recurso/{id}
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar<T extends Registro>(recurso: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${recurso}/`);
  }

  obtener<T extends Registro>(recurso: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.base}/${recurso}/${id}`);
  }

  crear<T extends Registro>(recurso: string, datos: object): Observable<T> {
    return this.http.post<T>(`${this.base}/${recurso}/`, datos);
  }

  actualizar<T extends Registro>(recurso: string, id: number, datos: object): Observable<T> {
    return this.http.put<T>(`${this.base}/${recurso}/${id}`, datos);
  }

  eliminar(recurso: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${recurso}/${id}`);
  }
}
