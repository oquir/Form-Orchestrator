import type { PointerEvent as ReactPointerEvent } from "react";

// Las dos formas del tirador reciben lo mismo: FieldResizeHandle ya resolvio el arrastre y el
// texto, ellas solo se dibujan.
export interface FieldResizeHandleVariantProps {
  isResizing: boolean;
  title: string;
  // Visible sin hover mientras el campo este seleccionado.
  pinned: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}
