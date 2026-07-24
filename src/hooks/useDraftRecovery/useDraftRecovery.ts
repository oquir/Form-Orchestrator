import { useEffect, useState } from "react";
import { clearDraft, loadDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import type { DraftRecovery, DraftRecoveryStatus } from "../../types/draftRecovery";
import type { DraftPayload } from "../../types/persistenceTypes";

export function useDraftRecovery(): DraftRecovery {
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null | undefined>(undefined);

  useEffect(() => {
    setPendingDraft(loadDraft());
  }, []);

  const status: DraftRecoveryStatus =
    pendingDraft === undefined ? "loading" : pendingDraft ? "recovering" : "ready";

  function restore(): void {
    if (pendingDraft) restoreDraft(pendingDraft);
    setPendingDraft(null);
  }

  function discard(): void {
    clearDraft();
    setPendingDraft(null);
  }

  return { status, draft: pendingDraft, restore, discard };
}
