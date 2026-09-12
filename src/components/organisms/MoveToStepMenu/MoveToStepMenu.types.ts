import type { CanvasTarget } from "../../../types/placement";

export interface MoveToStepMenuProps {
  onSelect: (target: CanvasTarget) => void;
}

export interface MoveTargetOption {
  target: CanvasTarget;
  // El numero que muestra la pestana del paso. Se calcula antes de quitar el activo, asi el paso 3
  // sigue diciendo 3 aunque el 2 no aparezca.
  number: number;
  title: string;
}

export interface MoveTargetSection {
  key: CanvasTarget["type"];
  caption: string | null;
  options: MoveTargetOption[];
}
