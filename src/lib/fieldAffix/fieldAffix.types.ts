// Lo minimo para leer los afijos, estructural para que entren CanvasField y ExportedField sin que
// esta carpeta conozca ninguno. Mismo molde que FormattableField.
export interface AffixableField {
  type: string;
  prefix?: string;
  suffix?: string;
}
