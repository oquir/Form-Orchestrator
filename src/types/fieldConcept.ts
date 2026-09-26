// Los conceptos tributarios: lo que el contrato fijo (DeclaracionIcaE) no contempla -- un archivo,
// un "acepto", un dato extra que pida un municipio -- viaja en una lista aparte al final del
// payload. Los nombres van en espanol porque esto ES el contrato con el backend, igual que
// FechasMaximasPresentacion. Ver lib/fieldConcept.

// El tipo de dato, no el del control: al backend le da igual si era un radio o un select. Es el
// mismo valor de la columna TipoDato de su tabla de conceptos, y decide cual valor* viene lleno.
export type ConceptValueKind = "texto" | "numero" | "booleano" | "lista" | "archivo";

export type ConceptValueKey = "valorTexto" | "valorNumero" | "valorBooleano" | "valorLista";

// Una propiedad por tipo de valor en vez de un `valor` que cambia de forma: del otro lado es una
// clase plana de C#, sin JsonElement ni converters. Solo viaja la que corresponde a `tipo`.
export interface ConceptoPayload {
  idConcepto: number;
  tipo: ConceptValueKind;
  valorTexto?: string;
  valorNumero?: number;
  valorBooleano?: boolean;
  valorLista?: string[];
}
