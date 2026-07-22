import type { FieldTypeDef } from "../types/fieldTypes";

export const FIELD_TYPES: FieldTypeDef[] = [
  { type: "text", label: "Texto", category: "basico" },
  { type: "number", label: "Número", category: "basico" },
  { type: "select", label: "Select", category: "basico" },
  { type: "textarea", label: "Área de texto", category: "basico" },
  { type: "checkbox", label: "Checkbox", category: "basico" },
  { type: "calculated", label: "Calculado", category: "basico" },
  { type: "file", label: "Archivo", category: "basico" },
  { type: "toggle_group", label: "Toggle Buttons", category: "complejo" },
  { type: "radio_group", label: "Radio Buttons", category: "complejo" },
];
