import { Layers } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";

export function CanvasAddGroupButton() {
  const addGroupToActiveStep = useFormStore((state) => state.addGroupToActiveStep);

  return (
    <DashedAddButton
      onClick={addGroupToActiveStep}
      title="Un bloque que el contribuyente puede repetir varias veces"
      className="mt-3 flex w-full items-center justify-center gap-1.5 border-sky-300 py-2 text-sky-600 hover:border-sky-400 hover:text-sky-700 dark:border-sky-500/40 dark:text-sky-400 dark:hover:border-sky-500 dark:hover:text-sky-300"
    >
      <Layers size={12} weight="Filled" /> Agregar grupo repetible
    </DashedAddButton>
  );
}
