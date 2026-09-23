import { useEffect, useState } from "react";
import { findFieldById, getActiveRows, useFormStore } from "../../store/formStore";
import type { ContextMenuTab } from "../../types/fieldContextMenu";
import {
  MENU_MAX_HEIGHT_RATIO,
  MENU_MIN_HEIGHT_PX,
  MENU_WIDTH_PX,
  VIEWPORT_MARGIN_PX,
} from "./useFieldContextMenu.constants";
import type {
  UseFieldContextMenuParams,
  UseFieldContextMenuResult,
} from "./useFieldContextMenu.types";

// Menu contextual del campo (clic derecho). El alto real depende de la pestana abierta y no se
// conoce antes de pintar, asi que no se estima: se le entrega el alto maximo que cabe desde donde
// se abrio y el cuerpo hace scroll dentro de ese limite.
export function useFieldContextMenu({
  menu,
  onClose,
}: UseFieldContextMenuParams): UseFieldContextMenuResult {
  const [activeTab, setActiveTab] = useState<ContextMenuTab>("attributes");
  const activeRows = useFormStore(getActiveRows);
  const removeFields = useFormStore((state) => state.removeFields);
  const field = findFieldById(activeRows, menu.fieldId);

  function handleSelectTab(tab: ContextMenuTab): void {
    setActiveTab(tab);
  }

  function handleDelete(): void {
    removeFields([menu.fieldId]);
    onClose();
  }

  useEffect(() => {
    const handlePointerDown = (): void => onClose();
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const viewportHeight: number = window.innerHeight;
  const left: number = Math.min(menu.x, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX);

  // Si debajo del clic no cabe ni el minimo utilizable, el menu sube lo justo para alcanzarlo.
  const spaceBelow: number = viewportHeight - menu.y - VIEWPORT_MARGIN_PX;
  const top: number = Math.max(
    VIEWPORT_MARGIN_PX,
    spaceBelow >= MENU_MIN_HEIGHT_PX
      ? menu.y
      : viewportHeight - MENU_MIN_HEIGHT_PX - VIEWPORT_MARGIN_PX,
  );

  return {
    field,
    activeTab,
    handleSelectTab,
    handleDelete,
    position: {
      left: Math.max(VIEWPORT_MARGIN_PX, left),
      top,
      width: MENU_WIDTH_PX,
      maxHeight: Math.min(
        viewportHeight * MENU_MAX_HEIGHT_RATIO,
        viewportHeight - top - VIEWPORT_MARGIN_PX,
      ),
    },
  };
}
