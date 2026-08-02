import type { ExportedField, ExportedRepeatableGroup, ExportedStep } from "./exportForm";

export type RuntimeValues = Record<string, unknown>;

export interface RuntimeScope {
  values: RuntimeValues;
  visible: Record<string, boolean>;
  disabled: Record<string, boolean>;
  computed: Record<string, boolean>;
}

export interface RuntimeSnapshot {
  root: RuntimeScope;
  groups: Record<string, RuntimeScope[]>;
  cycle: string[] | null;
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
  fieldsByName: Map<string, ExportedField>;
  groupsById: Map<string, ExportedRepeatableGroup>;
  groupIdByFieldName: Map<string, string>;
  rootFields: ExportedField[];
  groupFields: Map<string, ExportedField[]>;
  externalLabels: Map<string, string>;
}

export interface RuntimeIssue {
  kind: "cycle" | "schema" | "regex" | "typescript";
  field?: string;
  message: string;
}

export interface ValidationResult {
  errors: Record<string, string>;
  issues: RuntimeIssue[];
}
