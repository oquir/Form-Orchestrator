import { Play } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { SIMULATOR_BUTTON_CLASSES } from "./SimulatorButton.constants";
import type { SimulatorButtonProps } from "./SimulatorButton.types";

const LABEL: string = "Probar el formulario como lo vería quien lo llena";

export function SimulatorButton({ iconOnly = false }: SimulatorButtonProps) {
  const setSimulatorOpen = useFormStore((state) => state.setSimulatorOpen);

  return (
    <button
      type="button"
      onClick={() => setSimulatorOpen(true)}
      title={LABEL}
      aria-label={iconOnly ? LABEL : undefined}
      className={SIMULATOR_BUTTON_CLASSES}
    >
      <Play size={12} weight="Filled" />
      {!iconOnly && "Simulador"}
    </button>
  );
}
