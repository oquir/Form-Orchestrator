import type { TransferTabState } from "../../../types/transfer";

// El anillo va por fuera del borde (ring y no border) para no pelearse con el borde que la pestana
// ya usa para decir cual es la activa: son dos cosas distintas y se ven a la vez.
export function transferClasses(state: TransferTabState, isOver: boolean): string {
  if (state === "rejected") return "ring-2 ring-red-400 ring-offset-1 dark:ring-offset-neutral-900";

  if (state !== "ready") return "";

  return isOver
    ? "scale-105 ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-neutral-900"
    : "ring-2 ring-orange-300 ring-offset-1 dark:ring-orange-500/50 dark:ring-offset-neutral-900";
}
