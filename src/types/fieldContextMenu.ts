export type ContextMenuTab = "attributes" | "styles" | "validations" | "logic" | "apiMapping";

export interface FieldContextMenuState {
  fieldId: string;
  x: number;
  y: number;
}
