import type { DraftPayload } from "../../types/persistenceTypes";
import { migrateFieldNames } from "../fieldName/fieldName";
import { migrateRows } from "../rowLayout/rowLayout";
import { DRAFT_KEY } from "./persistence.constants";
import { draftPayloadSchema } from "./persistence.schema";

// Borrador en localStorage. No hay version de esquema: si la forma del store cambia, un borrador
// viejo deja de validar contra Zod y loadDraft devuelve null. Se pierde el borrador, pero el
// store no se corrompe, que es el mal menor de los dos.

export function saveDraft(payload: Omit<DraftPayload, "savedAt">): void {
  const draft: DraftPayload = { ...payload, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftPayload | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    // localStorage se puede editar desde las devtools, asi que lo guardado se trata como entrada
    // no confiable: si no valida se descarta entero en vez de cargarlo a medias.
    const parsed = draftPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const draft = parsed.data as DraftPayload;
    // El conjunto se comparte entre los dos lienzos para que no salgan dos campos con el mismo
    // nombre al renombrar borradores antiguos.
    const takenNames = new Set<string>();

    return {
      ...draft,
      formSteps: draft.formSteps.map((step) => ({
        ...step,
        rows: migrateFieldNames(migrateRows(step.rows), takenNames),
      })),
      introModal: {
        steps: draft.introModal.steps.map((step) => ({
          ...step,
          rows: migrateFieldNames(migrateRows(step.rows), takenNames),
        })),
      },
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
