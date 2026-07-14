import { useState } from "react";
import { Plus } from "reicon-react";
import { downloadFormExport } from "../../../lib/exportForm/exportForm";
import { getActiveRows, useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../molecules/DashedAddButton/DashedAddButton";
import { SaveButton } from "../../molecules/SaveButton/SaveButton";
import { CanvasRow } from "../CanvasRow/CanvasRow";
import { CanvasTabs } from "../CanvasTabs/CanvasTabs";
import { FieldContextMenu } from "../FieldContextMenu/FieldContextMenu";
import type { FieldContextMenuState } from "../FieldContextMenu/FieldContextMenu.types";
import { StepTitleEditor } from "../StepTitleEditor/StepTitleEditor";

export function Canvas() {
  const activeRows = useFormStore(getActiveRows);
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const addRowToActiveCanvas = useFormStore((state) => state.addRowToActiveCanvas);
  const [contextMenu, setContextMenu] = useState<FieldContextMenuState | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-neutral-100">
            Lienzo de trabajo
          </h1>
          <p className="text-sm text-slate-400 dark:text-neutral-500">
            Arrastra campos aquí para construir el formulario
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton />
          <button
            type="button"
            onClick={() => downloadFormExport(formSteps, setupConfig, introSteps)}
            className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-400"
          >
            Exportar JSON
          </button>
        </div>
      </header>

      <CanvasTabs />
      <StepTitleEditor />

      <div className="grid min-h-[60vh] grid-cols-16 content-start gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        {activeRows.map((row) => (
          <CanvasRow
            key={row.id}
            row={row}
            onFieldContextMenu={(fieldId, x, y) => setContextMenu({ fieldId, x, y })}
          />
        ))}
      </div>

      <DashedAddButton
        onClick={addRowToActiveCanvas}
        className="mt-3 flex w-full items-center justify-center gap-1.5 border-slate-300 py-2 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
      >
        <Plus size={12} weight="Filled" /> Agregar fila
      </DashedAddButton>

      {contextMenu && <FieldContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
}
