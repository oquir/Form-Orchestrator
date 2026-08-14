// Lo minimo para decidir como se dibujan las opciones. Va estructural y no como CanvasField para
// que sirva igual del lado del lienzo que del export, que son dos formas distintas del campo.
export interface InlineCapableField {
  type: string;
  inlineOptions?: boolean;
}
