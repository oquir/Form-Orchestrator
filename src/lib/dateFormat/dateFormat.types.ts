// Un tramo de un patron de fecha: un token que se llena con digitos o un separador que va tal cual.
export interface PatternSlot {
  kind: "token" | "literal";
  text: string;
}
