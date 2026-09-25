// Un salto de linea justo despues de return hace que JS inserte el punto y coma ahi (ASI) y el
// script devuelva undefined, asi que ese texto no se reconoce aunque el resto encaje.
export const RETURN_ON_SAME_LINE: RegExp = /^return[ \t]+\S/;

// Igual que el nombre que acepta REF_PATTERN. No se reusa REF_PATTERN porque es sticky y
// scanScript le mueve el lastIndex.
export const NAME_PATTERN: RegExp = /^[A-Za-z_][A-Za-z0-9_]*/;

export const REF_PADDING_PATTERN: RegExp = /^[ \t]*/;

export const NUMBER_PATTERN: RegExp = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i;

export const WHITESPACE_PATTERN: RegExp = /^\s*/;

export const ALL_WHITESPACE_PATTERN: RegExp = /\s+/g;

export const TRAILING_SEMICOLON_PATTERN: RegExp = /;$/;

export const SAME_ROW_CAPTION: string = "misma fila";

export const ALL_ROWS_CAPTION: string = "suma de todas las filas";
