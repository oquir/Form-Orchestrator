import type { DraftLoad, DraftPayload, FieldRename } from "../../types/persistenceTypes";
import { migrateFieldNames } from "../fieldName/fieldName";
import { migrateRows } from "../rowLayout/rowLayout";
import { DRAFT_KEY, DRAFT_SCHEMA_VERSION } from "./persistence.constants";
import { migrateDraft } from "./persistence.migrations";
import { draftPayloadSchema } from "./persistence.schema";
import type { LooseDraft } from "./persistence.types";

// Borrador en localStorage. Lleva version de esquema: un borrador de una forma anterior pasa por
// la cadena de migraciones antes de validarse, y solo se descarta si ni siquiera asi llega a la
// version de hoy. Lo que no cambia es el final: si no valida se pierde entero en vez de cargarse
// a medias, porque un store a medio llenar es peor que uno vacio.

export function saveDraft(payload: Omit<DraftPayload, "savedAt" | "schemaVersion">): void {
  const draft: DraftPayload = {
    ...payload,
    schemaVersion: DRAFT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
  };
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
    const stored: unknown = JSON.parse(raw);
    if (typeof stored !== "object" || stored === null) return { status: "invalid" };

    // Se migra antes de validar. Al reves seria descartar todo borrador de una version anterior
    // justo cuando la migracion podia salvarlo, que es para lo que existe.
    const parsed = draftPayloadSchema.safeParse(migrateDraft(stored as LooseDraft));
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
