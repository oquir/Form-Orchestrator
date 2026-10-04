// El valor de un campo fecha en modo rango. Las claves van en espanol porque el objeto viaja tal cual
// en el payload, como el resto de los nombres del contrato con la API.
export interface DateRangeValue {
  desde: string;
  hasta: string;
}

// Como se ve una fecha en el formulario y como viaja a la API. Los tokens son los de siempre en una
// documentacion de API (YYYY, MM, DD); lo demas es separador literal.
export type DateFormatId =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "DD-MM-YYYY"
  | "YYYY/MM/DD"
  | "DD.MM.YYYY"
  | "YYYYMMDD";

export interface DateFormatOption {
  id: DateFormatId;
  // El mismo patron con los tokens en espanol (AAAA), que es como lo lee quien arma el formulario.
  label: string;
  example: string;
}

// Lo minimo para saber como es un campo fecha. Va estructural y no como CanvasField para que sirva
// igual del lado del lienzo que del export, que son dos formas distintas del campo.
export interface DateCapableField {
  type: string;
  dateRange?: boolean;
  includesTime?: boolean;
  dateFormat?: DateFormatId;
}

export type DateBoundUnit = "days" | "months" | "years";

export type DateBoundDirection = "past" | "future";

// Lo mas temprano o lo mas tarde que acepta un campo fecha. "today" y "relative" se cuentan desde el
// dia en que se valida, no desde el dia en que se armo el formulario: un "no puede ser futura"
// exportado hoy tiene que seguir siendo verdad el ano que viene.
export type DateBound =
  | { kind: "today" }
  | { kind: "fixed"; date: string }
  | { kind: "relative"; amount: number; unit: DateBoundUnit; direction: DateBoundDirection };

// "min" es el limite de No antes de y "max" el de No despues de.
export type DateBoundSide = "min" | "max";
