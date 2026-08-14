import type { CanvasField } from "./field";
import type { GroupCheck } from "./groupCheck";

export interface CanvasRow {
  id: string;
  columns: number;
  fields: CanvasField[];
  groupId?: string;
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
