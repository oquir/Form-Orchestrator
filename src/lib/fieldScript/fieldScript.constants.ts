// Una referencia son dos llaves, un identificador y las dos de cierre. Entre medio se toleran
// espacios y tabulaciones pero nunca un salto de linea: una referencia se escribe en una linea.
// Las llaves dobles son lo que la separa del JS que la rodea: {{x}} no es JavaScript valido en
// ninguna expresion, asi que no puede confundirse con una desestructuracion o un objeto literal,
// que era el problema de la sintaxis vieja de una sola llave.
// Lleva la bandera sticky porque se prueba en una posicion concreta, no se busca por el texto.
export const REF_PATTERN: RegExp = /\{\{[ \t]*([A-Za-z_][A-Za-z0-9_]*)[ \t]*\}\}/y;
