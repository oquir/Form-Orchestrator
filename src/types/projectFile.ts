import type { DraftPayload, FieldRename } from "./persistenceTypes";

// Resultado de leer un JSON exportado para volver a abrirlo. A diferencia de DraftLoad, el error
// viaja con su mensaje: quien elige un archivo necesita saber que hacer con el (volver a
// exportarlo, actualizar el builder), no solo que no sirvio.
export type ProjectFileLoad =
  | { status: "ok"; draft: DraftPayload; renamed: FieldRename[] }
  | { status: "error"; message: string };

// Lo que se muestra del archivo antes de abrirlo, para confirmar que es el que se buscaba.
export interface ProjectFileSummary {
  formTypeLabel: string;
  stepCount: number;
  introStepCount: number;
  fieldCount: number;
  savedAt: string;
}
