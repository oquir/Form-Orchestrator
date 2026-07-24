import type { CanvasField } from "../../../../types/field";

export interface FileOptionsEditorProps {
  field: CanvasField;
}

export interface FileFormatPreset {
  id: string;
  label: string;
  tokens: string[];
}
