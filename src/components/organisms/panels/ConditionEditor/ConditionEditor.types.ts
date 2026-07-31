import type { CanvasField, ConditionKind } from "../../../../types/field";

export interface ConditionEditorProps {
  field: CanvasField;
  otherFields: CanvasField[];
  kind: ConditionKind;
}
