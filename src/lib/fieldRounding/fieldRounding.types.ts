// Lo minimo que hay que saber de un campo para redondearlo. Se declara estructural en vez de
// importar CanvasField o ExportedField porque los dos entran aca: el panel pregunta por uno y el
// simulador por el otro, y ninguno necesita que esta carpeta conozca su forma completa.
export interface RoundableField {
  type: string;
  rounding?: boolean;
}
