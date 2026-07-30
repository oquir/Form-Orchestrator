import type { CanvasField } from "./field";

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
