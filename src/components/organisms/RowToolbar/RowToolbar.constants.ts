// Una sola barra en lugar de cuatro anclajes distintos (columnas arriba a la izquierda, paleta al
// medio a la derecha, borrar arriba a la derecha y el tirador al medio a la izquierda): cuatro
// lugares que aprender para una sola fila.
//
// Mide 24px (p-0.5 + items de h-5) y se ancla en -top-5, o sea que ocupa de -20px a +4px: entra
// entera en el hueco entre filas y en el padding de la fila, sin llegar a los 12px donde empiezan
// los chips. Si creciera, taparia la esquina superior derecha del ultimo campo -- justo donde esta
// su propia X de borrar. z-20 porque la barra es su propio contexto de apilamiento
export const ROW_TOOLBAR_CLASSES: string =
  "absolute -top-5 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 shadow-sm dark:bg-surface-raised";

export const ROW_TOOLBAR_DANGER_ITEM_CLASSES: string =
  "flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-danger-surface hover:text-danger hover:cursor-pointer";
