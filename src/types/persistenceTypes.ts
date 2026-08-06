import type { SavedComponent } from "./field";
import type { FormStep, IntroModalState } from "./formStructure";
import type { SetupConfig } from "./setup";

export interface DraftPayload {
  formSteps: FormStep[];
  introModal: IntroModalState;
  savedComponents: SavedComponent[];
  setupConfig: SetupConfig;
  savedAt: string;
}

export interface FieldRename {
  from: string;
  to: string;
  label: string;
}

// "vacio" y "invalido" se separan porque no son lo mismo: no haber guardado nunca es normal, y un
// borrador que no valida es algo que hay que borrar y contar. Antes los dos devolvian null.
export type DraftLoad =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ok"; draft: DraftPayload; renamed: FieldRename[] };
