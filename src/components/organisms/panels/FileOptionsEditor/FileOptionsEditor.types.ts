import type { CanvasField } from "../../../../types/storeTypes";

export interface FileOptionsEditorProps {
  field: CanvasField;
}

export interface FileFormatPreset {
  id: string;
  label: string;
  tokens: string[];
}
