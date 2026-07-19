import type { EnableOperator } from "../../types/storeTypes";

/** Operadores que no requieren un valor de comparación (son unarios sobre el campo observado). */
export const OPERATORS_WITHOUT_VALUE: EnableOperator[] = [
  "isEmpty",
  "isNotEmpty",
  "isTruthy",
  "isFalsy",
];

/** Operadores por defecto cuando aún no hay un campo observado resuelto. */
export const DEFAULT_OPERATORS: EnableOperator[] = ["equals", "notEquals", "isEmpty", "isNotEmpty"];
