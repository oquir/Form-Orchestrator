import type { CanvasField } from "../../../types/field";
import type { CanvasRow, RepeatableGroup } from "../../../types/formStructure";

export interface RepeatableGroupBandProps {
  group: RepeatableGroup;
  rows: CanvasRow[];
  linkedLabels: Map<string, CanvasField>;
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
