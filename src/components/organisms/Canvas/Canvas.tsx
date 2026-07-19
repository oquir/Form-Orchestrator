import { useState } from "react";
import { Code, TerminalSquare } from "reicon-react";
import { downloadFormExport } from "../../../lib/exportForm/exportForm";
import { getActiveRows, useFormStore } from "../../../store/formStore";
import type { FieldContextMenuState } from "../../../types/fieldContextMenu";
import { SaveButton } from "../../molecules/SaveButton/SaveButton";
import { CanvasAddRowButton } from "../CanvasAddRowButton/CanvasAddRowButton";
import { CanvasRowsGrid } from "../CanvasRowsGrid/CanvasRowsGrid";
import { CanvasTabs } from "../CanvasTabs/CanvasTabs";
import { FieldContextMenu } from "../FieldContextMenu/FieldContextMenu";
import { JsonPreviewCanvas } from "../JsonPreviewCanvas/JsonPreviewCanvas";
import { StepTitleEditor } from "../StepTitleEditor/StepTitleEditor";

export function Canvas() {
  const activeRows = useFormStore(getActiveRows);
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const [contextMenu, setContextMenu] = useState<FieldContextMenuState | null>(null);
  const [isJsonView, setIsJsonView] = useState<boolean>(false);

  const isIntro: boolean = activeCanvas.type === "introStep";

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-neutral-100">
              {isJsonView ? "JSON en vivo" : "Lienzo de trabajo"}
            </h1>
            {!isJsonView &&
              (isIntro ? (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-white dark:text-neutral-900">
                  Modal de entrada
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-white dark:text-neutral-900">
                  Formulario
                </span>
              ))}
          </div>
          <p className="text-sm text-slate-400 dark:text-neutral-500">
            {isJsonView
              ? "Vista previa del JSON exportado del formulario completo"
              : isIntro
                ? "Editando el modal de entrada — flota sobre el formulario"
                : "Arrastra campos aquí para construir el formulario"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton />
          <button
            type="button"
            onClick={() => setIsJsonView((prev) => !prev)}
            aria-pressed={isJsonView}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:cursor-pointer ${
              isJsonView
                ? "border-orange-600 bg-orange-600 text-white hover:bg-orange-500 dark:border-orange-500 dark:bg-orange-500 dark:hover:bg-orange-400"
                : "border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            {isJsonView ? <Code size={14} weight="Filled" /> : <TerminalSquare size={14} />}
            {isJsonView ? "Volver al lienzo" : "Ver JSON"}
          </button>
          <button
            type="button"
            onClick={() => downloadFormExport(formSteps, setupConfig, introSteps)}
            className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-400"
          >
            Exportar JSON
          </button>
        </div>
      </header>

      {isJsonView ? (
        <JsonPreviewCanvas />
      ) : (
        <>
          <CanvasTabs />
          <StepTitleEditor />
        </>
      )}

      {!isJsonView &&
        (isIntro ? (
          <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-6 dark:bg-neutral-950">
            {/* Lienzo de fondo: decorativo y no editable, solo aparenta el formulario detrás */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-5 select-none rounded-lg border-2 border-dashed border-slate-200 bg-white p-4 opacity-50 blur-[1.5px] dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-col gap-3">
                <div className="h-9 w-1/3 rounded bg-slate-200 dark:bg-neutral-800" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-9 rounded bg-slate-200 dark:bg-neutral-800" />
                  <div className="h-9 rounded bg-slate-200 dark:bg-neutral-800" />
                </div>
                <div className="h-9 w-full rounded bg-slate-200 dark:bg-neutral-800" />
                <div className="h-9 w-3/4 rounded bg-slate-200 dark:bg-neutral-800" />
              </div>
            </div>

            {/* Backdrop del modal, para separar figura y fondo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-slate-900/10 dark:bg-black/40"
            />

            {/* Modal real y editable: más chico y cuadrado que el lienzo de fondo */}
            <div className="relative z-10 flex min-h-110 w-full max-w-140 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
              <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-neutral-800">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                  Modal de entrada
                </span>
              </div>
              <CanvasRowsGrid
                rows={activeRows}
                onFieldContextMenu={(fieldId, x, y) => setContextMenu({ fieldId, x, y })}
              />
              <CanvasAddRowButton />
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-[60vh] rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <CanvasRowsGrid
                rows={activeRows}
                onFieldContextMenu={(fieldId, x, y) => setContextMenu({ fieldId, x, y })}
              />
            </div>
            <CanvasAddRowButton />
          </>
        ))}

      {contextMenu && <FieldContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
}
