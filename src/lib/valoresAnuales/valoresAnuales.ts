import type { ValorAnual } from "../../types/valores";

// Busqueda de la fila de un ano dentro de la tabla de valores anuales. Aritmetica pura, sin React,
// sin store y sin localStorage: la capa que guarda es lib/valoresBank y los helpers que la exponen
// a un script son lib/scriptValores.

export function buscarValores(valores: ValorAnual[], anio: number): ValorAnual | null {
  if (!Number.isFinite(anio) || anio <= 0) return null;

  return valores.find((valor) => valor.anio === anio) ?? null;
}

// El ano de un "YYYY/MM/DD" o "YYYY-MM-DD", que es como viaja `hoy` en el RuntimeContext. Devuelve
// 0 y no NaN cuando el texto no sirve: un 0 no encuentra ninguna fila y se comporta como "no hay
// dato", mientras que un NaN se arrastraria hasta la comparacion sin decir nada.
export function anioDeTexto(fecha: string): number {
  const anio: number = Number.parseInt(fecha.slice(0, 4), 10);

  return Number.isFinite(anio) && anio > 0 ? anio : 0;
}

// Los anos que la tabla cubre, del mas nuevo al mas viejo. Es lo que el panel muestra y lo que
// permite ver de un vistazo que falta el ano en curso.
export function aniosCubiertos(valores: ValorAnual[]): number[] {
  return valores.map((valor) => valor.anio).sort((a, b) => b - a);
}
