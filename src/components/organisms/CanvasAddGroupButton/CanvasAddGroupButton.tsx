import { Layers } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";

export function CanvasAddGroupButton() {
  const addGroupToActiveStep = useFormStore((state) => state.addGroupToActiveStep);

  return (
    <DashedAddButton
      onClick={addGroupToActiveStep}
      title="Un bloque que el contribuyente puede repetir varias veces"
      className="mt-3 flex w-full items-center justify-center gap-1.5 border-brand-border py-2 text-brand-fg hover:border-brand hover:text-brand-hover"
    >
      <Layers size={12} weight="Filled" /> Agregar grupo repetible
    </DashedAddButton>
  );
}
