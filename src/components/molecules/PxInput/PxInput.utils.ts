const PLAIN_PX = /^\s*(\d+(?:\.\d+)?)\s*px\s*$/i;

// Devuelve el numero cuando el valor guardado son pixeles pelados, y null cuando es cualquier otra
// cosa. FieldStyles guarda una cadena CSS libre, asi que alguien pudo escribir "1rem" o "5%" a
// mano: eso es valido y el panel no tiene por que reescribirlo solo por abrirlo.
export function toPxAmount(value: string): string | null {
  if (value.trim() === "") return "";

  const match: RegExpExecArray | null = PLAIN_PX.exec(value);

  return match ? match[1] : null;
}
