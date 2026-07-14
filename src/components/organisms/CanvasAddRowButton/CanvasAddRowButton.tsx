import { Plus } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../molecules/DashedAddButton/DashedAddButton";

export function CanvasAddRowButton() {
  const addRowToActiveCanvas = useFormStore((state) => state.addRowToActiveCanvas);

  return (
    <DashedAddButton
      onClick={addRowToActiveCanvas}
      className="mt-3 flex w-full items-center justify-center gap-1.5 border-slate-300 py-2 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
    >
      <Plus size={12} weight="Filled" /> Agregar fila
    </DashedAddButton>
  );
}
