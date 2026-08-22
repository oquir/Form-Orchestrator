import type { CanvasField } from "./field";
import type { GroupCheck } from "./groupCheck";

// A proposito mas chico que FieldStyles: sin backgroundColor ni textColor. Una fila es un
// contenedor de layout, no algo que se lee como un campo, y pintarla entera abre las mismas
// preguntas de contraste que field.styles ya tiene sin resolver del lado del campo.
export interface RowStyles {
  customClasses?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface CanvasRow {
  id: string;
  columns: number;
  fields: CanvasField[];
  groupId?: string;
  styles?: RowStyles;
}

export interface RepeatableGroup {
  id: string;
  name: string;
  title: string;
  min: number;
  max: number;
  arrayPath?: string;
  // Comprobaciones que abarcan al grupo entero, no a un campo suyo. Ver types/groupCheck.
  checks?: GroupCheck[];
}

export interface FormStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
  groups?: RepeatableGroup[];
}

export interface IntroModalStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
}

export interface IntroModalState {
  steps: IntroModalStep[];
}

export type IntroStepTemplate = Omit<IntroModalStep, "stepId">;
export type FormStepTemplate = Omit<FormStep, "stepId">;
