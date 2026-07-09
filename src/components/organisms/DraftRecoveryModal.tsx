import type { DraftPayload } from "../../lib/persistence";
import { Button } from "../atoms/Button";
import { ModalActions } from "../molecules/ModalActions";
import { ModalShell } from "../molecules/ModalShell";

interface DraftRecoveryModalProps {
  draft: DraftPayload;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryModal({ draft, onRestore, onDiscard }: DraftRecoveryModalProps) {
  const savedAtLabel = new Date(draft.savedAt).toLocaleString();

  return (
    <ModalShell maxWidthClassName="max-w-md">
      <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Se encontró un borrador
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Hay un proyecto guardado automáticamente el {savedAtLabel}. ¿Quieres restaurarlo o empezar
        de nuevo?
      </p>
      <ModalActions>
        <Button
          variant="ghost"
          onClick={onDiscard}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Empezar de nuevo
        </Button>
        <Button
          variant="primary"
          onClick={onRestore}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Restaurar borrador
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
