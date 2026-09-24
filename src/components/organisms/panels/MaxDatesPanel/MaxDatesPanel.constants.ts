import type { DeclaracionKind } from "../../../../types/maxDates";

export {
  ACTION_CLASSES,
  BADGE_EMPTY_CLASSES,
  BADGE_LOADED_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
} from "../../../../constants/uiClasses";

export const DECLARACIONES: { kind: DeclaracionKind; label: string }[] = [
  { kind: "ica", label: "Industria y Comercio" },
  { kind: "reteica", label: "Retención (ReteICA)" },
  { kind: "autoretencionIca", label: "Autorretención" },
];

export const TABLE_DESCRIPTION: string =
  "La tabla con la que fechaLimite(), diasDeMora() y mesesDeMora() calculan en el simulador. La generada se recalcula sola con el año en curso; editarla o pegar una guarda una copia tuya.";
