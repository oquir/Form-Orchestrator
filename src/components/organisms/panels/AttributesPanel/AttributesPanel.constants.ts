export const FILE_FORMAT_PRESETS: { id: string; label: string; tokens: string[] }[] = [
  { id: "images", label: "Imágenes", tokens: ["image/*"] },
  { id: "pdf", label: "PDF", tokens: [".pdf"] },
  { id: "excel", label: "Excel", tokens: [".xls", ".xlsx"] },
  { id: "word", label: "Word", tokens: [".doc", ".docx"] },
  { id: "csv", label: "CSV", tokens: [".csv"] },
  { id: "xml", label: "XML", tokens: [".xml"] },
  { id: "zip", label: "ZIP/RAR", tokens: [".zip", ".rar"] },
  { id: "txt", label: "Texto", tokens: [".txt"] },
];
