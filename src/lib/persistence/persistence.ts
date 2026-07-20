import type { DraftPayload } from "../../types/persistenceTypes";
import { migrateRows } from "../rowLayout/rowLayout";
import { DRAFT_KEY } from "./persistence.constants";

export function saveDraft(payload: Omit<DraftPayload, "savedAt">): void {
  const draft: DraftPayload = { ...payload, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftPayload | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const draft: DraftPayload = JSON.parse(raw) as DraftPayload;
    return {
      ...draft,
      formSteps: draft.formSteps.map((step) => ({ ...step, rows: migrateRows(step.rows) })),
      introModal: {
        steps: draft.introModal.steps.map((step) => ({
          ...step,
          rows: migrateRows(step.rows),
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
