// Coma o punto como separador decimal: quien no programa escribe 0,15 y quien si, 0.15. Nada de
// miles ni de notacion cientifica; un factor asi no los necesita.
export const MULTIPLIER_PATTERN: RegExp = /^-?\d+(?:[.,]\d+)?$/;

export const INVALID_MULTIPLIER_MESSAGE: string =
  "El multiplicador tiene que ser un número, por ejemplo 0.15.";
