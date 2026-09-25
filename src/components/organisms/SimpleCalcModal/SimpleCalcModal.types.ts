import type { CanvasField } from "../../../types/field";

export interface SimpleCalcModalProps {
  field: CanvasField;
  candidates: CanvasField[];
  onClose: () => void;
}
