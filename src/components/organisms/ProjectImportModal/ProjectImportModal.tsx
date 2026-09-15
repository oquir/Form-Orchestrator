import { WARNING_BANNER_CLASSES } from "../../../constants/uiClasses";
import { useProjectImport } from "../../../hooks/useProjectImport/useProjectImport";
import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { ProjectFilePicker } from "../../molecules/ProjectFilePicker/ProjectFilePicker";
import type { ProjectImportModalProps } from "./ProjectImportModal.types";

export function ProjectImportModal({ onClose }: ProjectImportModalProps) {
  const { fileName, result, summary, isReading, canOpen, pickFile, openProject } =
    useProjectImport();

  function handleOpen(): void {
    openProject();
    onClose();
  }

  return (
    <ModalShell maxWidthClassName="max-w-md">
      <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        Abrir formulario
      </h2>
      <p className={`mb-4 ${WARNING_BANNER_CLASSES}`}>
        Abrir un formulario reemplaza el actual y no se puede deshacer. Si quieres conservarlo,
        expórtalo antes.
      </p>

      <ProjectFilePicker
        fileName={fileName}
        result={result}
        summary={summary}
        isReading={isReading}
        onPick={pickFile}
      />

      <div className="mt-4">
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
            disabled={!canOpen}
            onClick={handleOpen}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Abrir formulario
          </Button>
        </ModalActions>
      </div>
    </ModalShell>
  );
}
