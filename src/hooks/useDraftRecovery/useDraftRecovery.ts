import { useEffect, useState } from "react";
import { clearDraft, loadDraft } from "../../lib/persistence/persistence";
import { useFormStore } from "../../store/formStore";
import type { DraftRecovery, DraftRecoveryStatus } from "../../types/draftRecovery";
import type { DraftLoad } from "../../types/persistenceTypes";
import { NOTHING_PENDING } from "./useDraftRecovery.constants";
import type { PendingDraft } from "./useDraftRecovery.types";

// Corre antes que el asistente de configuracion: si hay borrador guardado se ofrece recuperarlo.
export function useDraftRecovery(): DraftRecovery {
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  // null es "todavia no se miro". Sin ese estado el primer render mostraria el asistente un
  // instante antes de descubrir que habia borrador.
  const [pending, setPending] = useState<PendingDraft | null>(null);

  useEffect(() => {
    const result: DraftLoad = loadDraft();

    // Un borrador que no valida se borra en el acto. Dejarlo seria releerlo y rechazarlo en cada
    // arranque, y el objeto manipulado sobreviviria a la sesion que lo detecto. Al store nunca
    // llega: solo restoreDraft lo escribe, y ese camino exige status "ok".
    if (result.status === "invalid") {
      clearDraft();
      setPending({ draft: null, renamed: [], wasInvalid: true });
      return;
    }

    if (result.status === "empty") {
      setPending(NOTHING_PENDING);
      return;
    }

    setPending({ draft: result.draft, renamed: result.renamed, wasInvalid: false });
  }, []);

  const status: DraftRecoveryStatus =
    pending === null ? "loading" : pending.draft ? "recovering" : "ready";

  function restore(): void {
    if (pending?.draft) restoreDraft(pending.draft);
    setPending(NOTHING_PENDING);
  }

  function discard(): void {
    clearDraft();
    setPending(NOTHING_PENDING);
  }

  return {
    status,
    draft: pending?.draft ?? null,
    renamed: pending?.renamed ?? [],
    wasInvalid: pending?.wasInvalid ?? false,
    restore,
    discard,
  };
}
