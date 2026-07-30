import type { CanvasRow, RepeatableGroup } from "../../../types/formStructure";

export interface RepeatableGroupBandProps {
  group: RepeatableGroup;
  rows: CanvasRow[];
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void;
}
