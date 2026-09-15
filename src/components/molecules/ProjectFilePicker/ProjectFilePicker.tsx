import { type ChangeEvent, useRef } from "react";
import { Button } from "../../atoms/Button/Button";
import { FieldRenameNotice } from "../FieldRenameNotice/FieldRenameNotice";
import { ERROR_BOX_CLASSES, FILE_ACCEPT, SUMMARY_BOX_CLASSES } from "./ProjectFilePicker.constants";
import type { ProjectFilePickerProps } from "./ProjectFilePicker.types";
import { summaryLine } from "./ProjectFilePicker.utils";

export function ProjectFilePicker({
  fileName,
  result,
  summary,
  isReading,
  onPick,
}: ProjectFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const file: File | undefined = event.target.files?.[0];
    // Se vacia para que volver a elegir el mismo archivo, ya corregido, dispare change otra vez.
    event.target.value = "";
    if (file) onPick(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600 dark:text-neutral-300">
        Elige el JSON que se descargó con <strong>Exportar</strong>: trae el formulario completo,
        listo para seguir editándolo.
      </p>

      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 px-3 py-1.5 text-sm hover:cursor-pointer"
        >
          Elegir archivo
        </Button>
        <span className="truncate text-xs text-slate-500 dark:text-neutral-400">
          {isReading ? "Leyendo…" : (fileName ?? "Ningún archivo elegido")}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={FILE_ACCEPT}
          aria-label="Archivo JSON exportado"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {result?.status === "error" && <p className={ERROR_BOX_CLASSES}>{result.message}</p>}

      {summary && (
        <div className={SUMMARY_BOX_CLASSES}>
          <p className="text-sm font-medium text-slate-800 dark:text-neutral-100">
            {summary.formTypeLabel}
          </p>
          <p className="text-xs text-slate-500 dark:text-neutral-400">{summaryLine(summary)}</p>
          <p className="text-xs text-slate-400 dark:text-neutral-500">
            Exportado el {new Date(summary.savedAt).toLocaleString()}
          </p>
        </div>
      )}

      {result?.status === "ok" && <FieldRenameNotice renamed={result.renamed} />}

      <p className="text-[11px] text-slate-400 dark:text-neutral-500">
        Abre solo archivos de personas de confianza: sus scripts se ejecutan en el simulador.
      </p>
    </div>
  );
}
