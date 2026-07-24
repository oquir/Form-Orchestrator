import type { CanvasField } from "./field";

export interface CanvasRow {
  id: string;
  columns: number;
  fields: CanvasField[];
}

export interface FormStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: CanvasRow[];
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
