// Igual que RoundableField y FormattableField: lo minimo para decidir el signo de un campo,
// estructural para que entren CanvasField y ExportedField sin que esta carpeta conozca ninguno.
export interface SignedField {
  type: string;
  allowsNegative?: boolean;
}

// El recorte informa si ocurrio, no solo el valor. El simulador lo avisa bajo el campo: un 0
// donde el usuario esperaba un negativo, sin explicacion, se lee como un calculo roto.
export interface ClampResult {
  value: unknown;
  clamped: boolean;
}
