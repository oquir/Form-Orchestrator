import type { FieldTypeDef } from "../../types/fieldTypes";

export interface PendingOptionsField {
  rowId: string;
  fieldType: FieldTypeDef;
  placement?: { colStart: number; colSpan: number };
}

export interface PointerPosition {
  x: number;
  y: number;
}
