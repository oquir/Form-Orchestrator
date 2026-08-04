// El alfabeto del lenguaje. IDENT_START deja fuera los digitos, asi que un nombre de campo no
// puede empezar por numero: es lo que permite decidir si un token es cifra o identificador
// mirando solo el primer caracter.
export const DIGIT = /[0-9]/;
export const IDENT_START = /[A-Za-z_]/;
export const IDENT_PART = /[A-Za-z0-9_]/;
export const WHITESPACE = /\s/;

export const FORMULA_OPERATORS: string[] = ["+", "-", "*", "/", "(", ")", ","];
