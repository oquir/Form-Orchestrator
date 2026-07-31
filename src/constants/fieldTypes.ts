import type { FieldTypeDef } from "../types/fieldTypes";

export const OPTION_BASED_FIELD_TYPES: string[] = [
  "select",
  "search_select",
  "toggle_group",
  "radio_group",
  "checkbox_group",
];

export const MULTI_VALUE_FIELD_TYPES: string[] = ["checkbox_group"];

export const PRESENTATIONAL_FIELD_TYPES: string[] = ["label"];

export const FIELD_TYPES: FieldTypeDef[] = [
  { type: "text", label: "Texto", category: "basico" },
  { type: "number", label: "Número", category: "basico" },
  { type: "select", label: "Select", category: "basico" },
  { type: "textarea", label: "Área de texto", category: "basico" },
  { type: "checkbox", label: "Checkbox", category: "basico" },
  { type: "calculated", label: "Calculado", category: "basico" },
  { type: "file", label: "Archivo", category: "basico" },
  { type: "search_select", label: "Select con búsqueda", category: "complejo" },
  { type: "toggle_group", label: "Toggle Buttons", category: "complejo" },
  { type: "radio_group", label: "Radio Buttons", category: "complejo" },
  { type: "checkbox_group", label: "Checkbox Group", category: "complejo" },
  { type: "label", label: "Etiqueta", category: "contenido" },
];
