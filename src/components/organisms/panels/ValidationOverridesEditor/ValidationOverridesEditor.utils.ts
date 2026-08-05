// Un input vacio tiene que borrar la regla, no guardarla como 0: dejar el campo en blanco quiere
// decir "esto lo hereda de la validacion de base".
export function toNumberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;

  const parsed: number = Number(raw);

  return Number.isNaN(parsed) ? undefined : parsed;
}
