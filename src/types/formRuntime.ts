import type { ExportedField, ExportedRepeatableGroup, ExportedStep } from "./exportForm";
import type { DeclaracionKind, ReglaAnio } from "./maxDates";
import type { ValorAnual } from "./valores";

// Lo que el runtime necesita ADEMAS del export. Va como segundo argumento y no dentro del modelo a
// proposito: son datos que el consumidor recibe por otro lado -- su propio endpoint -- asi que el
// simulador los recibe igual, y la separacion queda a la vista en la firma.
export interface RuntimeContext {
  // Ya resueltas al tipo de declaracion que es este formulario, para que los helpers no tengan que
  // saber si estan en ICA o en retencion.
  reglas: ReglaAnio[];
  // "YYYY/MM/DD". Entra por parametro en vez de leerse del reloj adentro del helper para poder
  // comprobar la mora sin tocar la hora del sistema.
  hoy: string;
  // La UVT y el salario minimo por ano. Del mismo lado de la frontera que `reglas`: el consumidor
  // los recibe de su API y el simulador del banco de valores, nunca del JSON exportado.
  valores: ValorAnual[];
}

export type RuntimeValues = Record<string, unknown>;

export interface RuntimeScope {
  values: RuntimeValues;
  visible: Record<string, boolean>;
  disabled: Record<string, boolean>;
  computed: Record<string, boolean>;
  // Los que dieron negativo en un campo que no los admite y quedaron en 0. Es solo del simulador
  // -- no viaja en el export -- y existe para que el 0 no aparezca sin explicacion.
  clamped: Record<string, boolean>;
}

export interface RuntimeSnapshot {
  root: RuntimeScope;
  groups: Record<string, RuntimeScope[]>;
  cycle: string[] | null;
  // Lo que fallo al calcular. Viaja en el snapshot y no en la validacion porque se descubre
  // ejecutando, no validando; validateRuntime lo junta con el resto para mostrarlo en un solo sitio.
  issues: RuntimeIssue[];
}

export interface PreviewState {
  values: RuntimeValues;
  groups: Record<string, RuntimeValues[]>;
}

export interface RuntimeModel {
  steps: ExportedStep[];
  introSteps: ExportedStep[];
  hasIntroModal: boolean;
  gridBaseColumns: number;
  prelude: string;
  // Que declaracion es, leido de projectMeta.formType. Decide cual de las tres listas de la tabla
  // de vencimientos aplica.
  declaracion: DeclaracionKind;
  fieldsByName: Map<string, ExportedField>;
  groupsById: Map<string, ExportedRepeatableGroup>;
  groupIdByFieldName: Map<string, string>;
  rootFields: ExportedField[];
  groupFields: Map<string, ExportedField[]>;
  externalLabels: Map<string, string>;
}

export interface RuntimeIssue {
  kind: "cycle" | "schema" | "regex" | "script";
  field?: string;
  message: string;
}

export interface ValidationResult {
  errors: Record<string, string>;
  issues: RuntimeIssue[];
}
