import type { ConditionKind } from "../../../../hooks/useConditionEditor/useConditionEditor.types";
import type { CanvasField } from "../../../../types/field";

export interface ConditionEditorProps {
  field: CanvasField;
  otherFields: CanvasField[];
  kind: ConditionKind;
}
