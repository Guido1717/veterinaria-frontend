import { HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../environments/environment';

interface ErrorValidacion {
  loc?: (string | number)[];
  msg?: string;
}

/** Traduce la respuesta de error de la API a un mensaje para la persona. */
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }
  if (error.status === 0) {
    return `No hay conexión con la API. Verifica que esté corriendo en ${environment.apiUrl}.`;
  }

  const detalle: unknown = error.error?.detail;

  // 400, 404 y 409: la API responde {"detail": "texto"}.
  if (typeof detalle === 'string') {
    return detalle;
  }
  // 422: validación de FastAPI, {"detail": [{loc, msg, ...}]}.
  if (Array.isArray(detalle)) {
    const partes = (detalle as ErrorValidacion[]).map((d) => {
      const campo = d.loc?.[d.loc.length - 1];
      return campo ? `${campo}: ${d.msg}` : String(d.msg);
    });
    return `Revisa los datos. ${partes.join('; ')}`;
  }
  return `Error ${error.status} al comunicarse con la API.`;
}
