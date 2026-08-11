import type { ExportedField, ExportedRepeatableGroup, ExportedStep } from "./exportForm";

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
