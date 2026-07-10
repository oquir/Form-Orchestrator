import type { DraftPayload } from "../../types/persistenceTypes";
import { DRAFT_KEY } from "./persistence.constants";

export function saveDraft(payload: Omit<DraftPayload, "savedAt">): void {
  const draft: DraftPayload = { ...payload, savedAt: new Date().toISOString() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftPayload | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DraftPayload;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
