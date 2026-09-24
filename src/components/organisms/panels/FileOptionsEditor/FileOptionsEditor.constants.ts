import type { FileFormatPreset } from "./FileOptionsEditor.types";

export const FILE_FORMAT_PRESETS: FileFormatPreset[] = [
  { id: "images", label: "Imágenes", tokens: ["image/*"] },
  { id: "pdf", label: "PDF", tokens: [".pdf"] },
  { id: "excel", label: "Excel", tokens: [".xls", ".xlsx"] },
  { id: "word", label: "Word", tokens: [".doc", ".docx"] },
  { id: "csv", label: "CSV", tokens: [".csv"] },
  { id: "xml", label: "XML", tokens: [".xml"] },
  { id: "zip", label: "ZIP/RAR", tokens: [".zip", ".rar"] },
  { id: "txt", label: "Texto", tokens: [".txt"] },
];

export const FILE_DESCRIPTION: string =
  "Qué tipos de archivo acepta el campo y cuánto puede pesar cada uno. Los dos límites quedan en su esquema de validación, así que el aplicativo los hace cumplir al adjuntar.";
