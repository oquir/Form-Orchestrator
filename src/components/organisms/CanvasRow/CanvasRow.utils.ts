import type { RowBorderState } from "./CanvasRow.types";

// El punteado se reserva para lo que de verdad significa: una fila vacia esperando un campo, o una
// que esta recibiendo un arrastre. Una fila con campos no necesita marco propio salvo mientras se
// la esta tocando, y ocho marcos punteados hacian que el lienzo se leyera como ocho cajas en obra.
// `border-2` nunca se quita, solo se vuelve transparente: sin el ancho, la fila se correria dos
// pixeles cada vez que el puntero pasa por encima.
export function getRowBorderClasses(state: RowBorderState): string {
  if (state.isOver) {
    return "border-dashed border-slate-400 bg-slate-50 dark:border-neutral-500 dark:bg-neutral-800/60";
  }

  if (state.isEmpty) return "border-dashed border-slate-200 dark:border-neutral-700";

  if (state.pinned) return "border-slate-200 dark:border-neutral-700";

  return "border-transparent hover:border-slate-200 dark:hover:border-neutral-800";
}
