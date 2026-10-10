// Como cuenta una clave del export para `requires`.
// - "core": el esqueleto que cualquier consumidor ya entiende. Nunca se declara.
// - "feature": se declara cuando trae algo: ni undefined, ni false, ni texto, lista u objeto vacio.
// - "present": se declara con solo aparecer. Existe por allowsNegative, que viaja unicamente como
//   false: con "feature" no se declararia nunca.
export type KeyRule = "core" | "feature" | "present";

// Record sobre todas las claves del tipo, opcionales incluidas: agregar una clave al export sin
// clasificarla en su tabla no compila.
export type KeyTable<T> = Record<keyof T, KeyRule>;
