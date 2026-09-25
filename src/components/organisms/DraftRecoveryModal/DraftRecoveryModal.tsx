import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { FieldRenameNotice } from "../../molecules/FieldRenameNotice/FieldRenameNotice";
import type { DraftRecoveryModalProps } from "./DraftRecoveryModal.types";

export function DraftRecoveryModal({
  draft,
  renamed,
  onRestore,
  onDiscard,
}: DraftRecoveryModalProps) {
  const savedAtLabel = new Date(draft.savedAt).toLocaleString();

  return (
    <ModalShell
      maxWidthClassName="max-w-md"
      title="Se encontró un borrador"
      footer={
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
      }
    >
      <p className="text-sm text-slate-500 dark:text-neutral-400">
        Hay un proyecto guardado automáticamente el {savedAtLabel}. ¿Quieres restaurarlo o empezar
        de nuevo?
      </p>

      <FieldRenameNotice renamed={renamed} />
    </ModalShell>
  );
}
