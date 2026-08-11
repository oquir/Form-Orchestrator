// Igual que RoundableField: lo minimo para decidir como se muestra un campo, estructural para que
// entren tanto CanvasField como ExportedField sin que esta carpeta conozca ninguno de los dos.
export interface FormattableField {
  type: string;
  formatted?: boolean;
  // Cuantos decimales se muestran y se dejan teclear. Ausente = los que tenga, hasta el tope.
  decimals?: number;
}
