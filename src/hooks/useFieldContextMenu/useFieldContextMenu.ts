import { useEffect, useState } from "react";
import { findFieldById, getActiveRows, useFormStore } from "../../store/formStore";
import type { ContextMenuTab } from "../../types/fieldContextMenu";
import type {
  UseFieldContextMenuParams,
  UseFieldContextMenuResult,
} from "./useFieldContextMenu.types";
import { getMenuPosition } from "./useFieldContextMenu.utils";

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

  return {
    field,
    activeTab,
    handleSelectTab,
    handleDelete,
    position: getMenuPosition(menu.x, menu.y, window.innerWidth, window.innerHeight),
  };
}
