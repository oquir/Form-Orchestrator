import type { DraftLoad, DraftPayload, FieldRename } from "../../types/persistenceTypes";
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

export function loadDraft(): DraftLoad {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return { status: "empty" };

  try {
    // localStorage se puede editar desde las devtools, asi que lo guardado se trata como entrada
    // no confiable: si no valida se descarta entero en vez de cargarlo a medias. Quien lo borra es
    // useDraftRecovery: cargar no deberia tener el efecto de destruir, y el descarte tiene que
    // quedar a la vista del que decide mostrar el aviso.
    const parsed = draftPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { status: "invalid" };

    const draft = parsed.data as DraftPayload;
    // El conjunto se comparte entre los dos lienzos porque el export los mezcla en un unico
    // espacio de nombres: un campo del modal de intro choca con uno del formulario.
    const takenNames = new Set<string>();
    const renamed: FieldRename[] = [];

    const migrated: DraftPayload = {
      ...draft,
      formSteps: draft.formSteps.map((step) => ({
        ...step,
        rows: migrateFieldNames(migrateRows(step.rows), takenNames, renamed),
      })),
      introModal: {
        steps: draft.introModal.steps.map((step) => ({
          ...step,
          rows: migrateFieldNames(migrateRows(step.rows), takenNames, renamed),
        })),
      },
    };

    return { status: "ok", draft: migrated, renamed };
  } catch {
    return { status: "invalid" };
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
