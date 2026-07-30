import type { CanvasField } from "../../../types/field";

export interface FormulaInputProps {
  id: string;
  label: string;
  value: string;
  candidates: CanvasField[];
  selfName?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}
