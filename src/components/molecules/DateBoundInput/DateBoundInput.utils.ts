import type { DateBound } from "../../../types/fieldDate";
import type { DateBoundMode } from "./DateBoundInput.types";

export function boundMode(bound: DateBound | undefined): DateBoundMode {
  if (!bound) return "none";
  if (bound.kind === "relative") return bound.direction;

  return bound.kind;
}

// Entre "Hace…" y "Dentro de…" se conserva la cantidad y la unidad: corregir la direccion de
// "Hace 18 años" no obliga a volver a escribir el 18.
export function boundForMode(
  mode: DateBoundMode,
  current: DateBound | undefined,
): DateBound | undefined {
  switch (mode) {
    case "none":
      return undefined;
    case "today":
      return { kind: "today" };
    case "fixed":
      return { kind: "fixed", date: current?.kind === "fixed" ? current.date : "" };
    case "past":
    case "future":
      return current?.kind === "relative"
        ? { ...current, direction: mode }
        : { kind: "relative", amount: 1, unit: "years", direction: mode };
  }
}
