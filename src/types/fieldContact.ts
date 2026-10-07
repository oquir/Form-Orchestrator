// Un patron con su mensaje, ya resuelto entre el que escribio el autor y el que trae el tipo.
export interface PatternRule {
  pattern: string;
  message?: string;
}

// Que numero pide un campo telefono. Cada uno trae su propio patron de fabrica.
export type PhoneKind = "celular" | "fijo";
