// Una referencia es una llave, un identificador y la llave de cierre. Entre medio se toleran
// espacios y tabulaciones pero nunca un salto de linea, y eso ultimo es deliberado: es lo que
// impide que un objeto literal escrito en varias lineas se confunda con una referencia.
// Lleva la bandera sticky porque se prueba en una posicion concreta, no se busca por el texto.
export const REF_PATTERN: RegExp = /\{[ \t]*([A-Za-z_][A-Za-z0-9_]*)[ \t]*\}/y;
