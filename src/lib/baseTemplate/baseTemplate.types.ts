import type { FormStep, IntroModalStep } from "../../types/formStructure";

export type IntroStepTemplate = Omit<IntroModalStep, "stepId">;
export type FormStepTemplate = Omit<FormStep, "stepId">;

export interface FieldSpec {
  name: string;
  type: string;
  label: string;
  colSpan: number;
  path?: string;
  excluded?: boolean;
  required?: boolean;
  min?: number;
  formula?: string;
  alwaysDisabled?: boolean;
}
