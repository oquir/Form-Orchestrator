import { useEffect, useState } from "react";
import { clearDraft, loadDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import type { DraftRecovery, DraftRecoveryStatus } from "../../types/draftRecovery";
import type { DraftPayload } from "../../types/persistenceTypes";

// Corre antes que el asistente de configuracion: si hay borrador guardado se ofrece recuperarlo.
export function useDraftRecovery(): DraftRecovery {
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  // Tres estados en una variable: undefined es "todavia no se miro", null es "no hay borrador" y
  // un objeto es "hay uno esperando respuesta". Sin el undefined, el primer render mostraria el
  // asistente un instante antes de descubrir que habia borrador.
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
