import { useState } from "react";
import { saveDraft } from "../../lib/persistence/persistence";
import { readProjectFile, summarizeProjectFile } from "../../lib/projectFile/projectFile";
import { useFormStore } from "../../store/formStore";
import type { ProjectFileLoad, ProjectFileSummary } from "../../types/projectFile";
import { UNREADABLE_FILE_MESSAGE } from "./useProjectImport.constants";
import type { UseProjectImportResult } from "./useProjectImport.types";

// Abrir un formulario exportado: lee el archivo, deja ver que trae y lo carga cuando se confirma.
// Lo comparten el asistente de inicio y el modal del panel derecho. La lectura y la validacion
// viven en lib/projectFile; aca queda el estado de la eleccion y la escritura en el store.
export function useProjectImport(): UseProjectImportResult {
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  const markSaved = useFormStore((state) => state.markSaved);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ProjectFileLoad | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);

  async function pickFile(file: File): Promise<void> {
    setFileName(file.name);
    setIsReading(true);

    try {
      const text: string = await file.text();
      setResult(readProjectFile(text));
    } catch {
      // Un archivo que se movio despues de elegirlo, o que el navegador no deja leer.
      setResult({ status: "error", message: UNREADABLE_FILE_MESSAGE });
    } finally {
      setIsReading(false);
    }
  }

  function openProject(): void {
    if (result?.status !== "ok") return;

    const { draft } = result;
    restoreDraft(draft);
    // Se guarda en el acto y no con el autoguardado: recargar dentro de esos tres minutos
    // devolveria el borrador anterior, o ninguno, en vez del formulario que se acaba de abrir.
    saveDraft({
      formSteps: draft.formSteps,
      introModal: draft.introModal,
      formScript: draft.formScript,
      setupConfig: draft.setupConfig,
    });
    markSaved();
  }

  const summary: ProjectFileSummary | null =
    result?.status === "ok" ? summarizeProjectFile(result.draft) : null;

  return {
    fileName,
    result,
    summary,
    isReading,
    canOpen: result?.status === "ok" && !isReading,
    pickFile,
    openProject,
  };
}
