import type { DraftPayload } from "../../types/persistenceTypes";
import { migrateFieldNames } from "../fieldName/fieldName";
import { migrateRows } from "../rowLayout/rowLayout";
import { DRAFT_KEY } from "./persistence.constants";
import { draftPayloadSchema } from "./persistence.schema";

export function saveDraft(payload: Omit<DraftPayload, "savedAt">): void {
  const draft: DraftPayload = { ...payload, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftPayload | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = draftPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const draft = parsed.data as DraftPayload;
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
