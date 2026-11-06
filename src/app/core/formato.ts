const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Convierte 'YYYY-MM-DD' en '15 sep 2026'.
 * Se hace a mano para no pasar por Date, que movería el día por la zona horaria.
 */
export function formatearFecha(valor: unknown): string {
  if (typeof valor !== 'string') return '—';
  const [anio, mes, dia] = valor.split('-');
  if (!anio || !mes || !dia) return valor;
  return `${Number(dia)} ${MESES[Number(mes) - 1] ?? mes} ${anio}`;
}

/** Recorta un texto largo para mostrarlo en listas. */
export function recortar(valor: unknown, maximo: number): string {
  const texto = String(valor ?? '');
  return texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto;
}
