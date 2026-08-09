import type { CanvasTarget } from "../../../types/placement";
import type { TransferTabState } from "../../../types/transfer";

export interface StepTabChipProps {
  index: number;
  label: string;
  active: boolean;
  canvasTarget: CanvasTarget;
  // "idle" fuera de un arrastre; "ready" cuando la pestana puede recibir la mudanza y "rejected"
  // cuando lo que se arrastra no puede salir de su paso.
  transferState?: TransferTabState;
  onSelect: () => void;
  onRemove?: () => void;
  removeTitle?: string;
  removeIconSize?: number;
  className?: string;
}
