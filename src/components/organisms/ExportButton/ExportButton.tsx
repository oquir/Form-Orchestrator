import { DirectSend2 } from "reicon-react";
import { useExportReview } from "../../../hooks/useExportReview/useExportReview";
import { ExportReviewModal } from "../ExportReviewModal/ExportReviewModal";
import { EXPORT_BUTTON_CLASSES } from "./ExportButton.constants";
import type { ExportButtonProps } from "./ExportButton.types";

const LABEL: string = "Revisar el formulario y descargarlo como JSON";

// El boton es el dueño de la revision y de su modal, igual que SaveButton lo es de useSaveButton.
// Lo montan el panel derecho y el chip que lo reemplaza cuando esta plegado, que nunca coexisten:
// asi nunca hay dos useExportReview vivos y ninguno de los dos necesita recibir props.
export function ExportButton({ iconOnly = false }: ExportButtonProps) {
  const { problems, hasErrors, requestExport, exportAnyway, goTo, close } = useExportReview();

  return (
    <>
      <button
        type="button"
        onClick={requestExport}
        title={LABEL}
        aria-label={iconOnly ? LABEL : undefined}
        className={EXPORT_BUTTON_CLASSES}
      >
        <DirectSend2 size={13} />
        {!iconOnly && "Exportar"}
      </button>

      {problems && (
        <ExportReviewModal
          problems={problems}
          hasErrors={hasErrors}
          onGoTo={goTo}
          onExport={exportAnyway}
          onClose={close}
        />
      )}
    </>
  );
}
