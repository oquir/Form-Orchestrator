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
