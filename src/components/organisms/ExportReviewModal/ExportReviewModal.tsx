import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import {
  ERROR_BADGE_CLASSES,
  ITEM_CLASSES,
  LIST_CLASSES,
  WARNING_BADGE_CLASSES,
} from "./ExportReviewModal.constants";
import type { ExportReviewModalProps } from "./ExportReviewModal.types";
import { summaryLabel } from "./ExportReviewModal.utils";

export function ExportReviewModal({
  problems,
  hasErrors,
  onGoTo,
  onExport,
  onClose,
}: ExportReviewModalProps) {
  return (
    <ModalShell
      maxWidthClassName="max-w-xl"
      title="Revisión antes de exportar"
      description={summaryLabel(problems)}
      onClose={onClose}
      footer={
        <ModalActions>
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={hasErrors}
            onClick={onExport}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Exportar
          </Button>
        </ModalActions>
      }
    >
      <ul className={LIST_CLASSES}>
        {problems.map((problem) => (
          <li key={problem.id} className={ITEM_CLASSES}>
            <span
              className={problem.severity === "error" ? ERROR_BADGE_CLASSES : WARNING_BADGE_CLASSES}
            >
              {problem.severity === "error" ? "Error" : "Aviso"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-800 dark:text-neutral-100">
                {problem.where}
              </p>
              <p className="mt-0.5 break-words text-xs text-slate-500 dark:text-neutral-400">
                {problem.message}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => onGoTo(problem)}
              className="shrink-0 px-2 py-1 text-xs hover:cursor-pointer"
            >
              Ir
            </Button>
          </li>
        ))}
      </ul>

      {hasErrors && (
        <p className="text-[11px] text-red-600 dark:text-red-400">
          Corrige los errores para exportar.
        </p>
      )}
    </ModalShell>
  );
}
