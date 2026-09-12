import { type PointerEvent, useState } from "react";
import { useCanvasViewport } from "../../../hooks/useCanvasViewport/useCanvasViewport";
import { getActiveGroups, getActiveRows, useFormStore } from "../../../store/formStore";
import type { FieldContextMenuState } from "../../../types/fieldContextMenu";
import { CanvasRowsGrid } from "../CanvasRowsGrid/CanvasRowsGrid";
import { CanvasToolLayer } from "../CanvasToolLayer/CanvasToolLayer";
import { FieldContextMenu } from "../FieldContextMenu/FieldContextMenu";
import { JsonPreviewCanvas } from "../JsonPreviewCanvas/JsonPreviewCanvas";
import { PayloadPreviewCanvas } from "../PayloadPreviewCanvas/PayloadPreviewCanvas";
import { TOOL_ROOT_CLASSES } from "./Canvas.constants";

export function Canvas() {
  const activeRows = useFormStore(getActiveRows);
  const activeGroups = useFormStore(getActiveGroups);
  const activeCanvas = useFormStore((state) => state.activeCanvas);
  const viewMode = useFormStore((state) => state.canvasViewMode);
  const canvasTool = useFormStore((state) => state.canvasTool);
  const selectField = useFormStore((state) => state.selectField);
  const [contextMenu, setContextMenu] = useState<FieldContextMenuState | null>(null);
  const { contentRef, rootStyle, contentStyle } = useCanvasViewport();

  const isIntro = activeCanvas.type === "introStep";

  // Soltar la seleccion al pulsar el fondo. Solo cuenta si el evento nace en este mismo nodo: si
  // vino de una fila o de un chip, event.target es ese otro nodo. Es pointerdown y no click por lo
  // mismo que useClickOutside: el click llega despues de que el de abajo ya recibio la pulsacion.
  function handleBackgroundPointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) selectField(null);
  }

  function openContextMenu(fieldId: string, x: number, y: number): void {
    setContextMenu({ fieldId, x, y });
  }

  if (viewMode !== "canvas") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        {viewMode === "json" && <JsonPreviewCanvas />}
        {viewMode === "payload" && <PayloadPreviewCanvas />}
      </div>
    );
  }

  return (
    <div style={rootStyle} className={TOOL_ROOT_CLASSES[canvasTool]}>
      {/* Con la mano o el marco el documento queda inerte: sin puntero no hay arrastre de dnd-kit,
          ni redimensionado, ni menu contextual, ni cromo por hover, y el puntero lo atiende el
          puerto. La paleta sigue soltando campos, porque dnd-kit resuelve la colision por rects y
          no por eventos de puntero. */}
      <div
        ref={contentRef}
        style={contentStyle}
        className={`mx-auto ${canvasTool === "move" ? "" : "pointer-events-none"}`}
      >
        {isIntro ? (
          <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-6 dark:bg-neutral-950">
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
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-slate-900/10 dark:bg-black/40"
            />
            <div
              onPointerDown={handleBackgroundPointerDown}
              className="relative z-10 flex min-h-110 w-full max-w-140 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-neutral-800">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                  Modal de entrada
                </span>
              </div>
              <CanvasRowsGrid rows={activeRows} onFieldContextMenu={openContextMenu} />
            </div>
          </div>
        ) : (
          <div
            onPointerDown={handleBackgroundPointerDown}
            className="min-h-[60vh] rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CanvasRowsGrid
              rows={activeRows}
              groups={activeGroups}
              onFieldContextMenu={openContextMenu}
            />
          </div>
        )}
      </div>

      <CanvasToolLayer />
      {contextMenu && <FieldContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
}
