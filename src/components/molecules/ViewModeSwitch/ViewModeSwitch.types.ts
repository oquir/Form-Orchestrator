import type { CanvasViewMode } from "../../../types/ui";

export interface ViewModeSwitchProps {
  activeMode: CanvasViewMode;
  onSelect: (mode: CanvasViewMode) => void;
}
