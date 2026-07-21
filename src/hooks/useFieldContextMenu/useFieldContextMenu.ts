import { useEffect, useState } from "react";
import type { ContextMenuTab } from "../../components/organisms/FieldContextMenu/FieldContextMenu.types";
import { findFieldById, getActiveRows, useFormStore } from "../../store/formStore";
import { MENU_HEIGHT_PX, MENU_WIDTH_PX, VIEWPORT_MARGIN_PX } from "./useFieldContextMenu.constants";
import type {
  UseFieldContextMenuParams,
  UseFieldContextMenuResult,
} from "./useFieldContextMenu.types";

export function useFieldContextMenu({
  menu,
  onClose,
}: UseFieldContextMenuParams): UseFieldContextMenuResult {
  const [activeTab, setActiveTab] = useState<ContextMenuTab>("attributes");
  const activeRows = useFormStore(getActiveRows);
  const removeField = useFormStore((state) => state.removeField);
  const field = findFieldById(activeRows, menu.fieldId);

  function handleSelectTab(tab: ContextMenuTab): void {
    setActiveTab(tab);
  }

  function handleDelete(): void {
    removeField(menu.fieldId);
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

  const left: number = Math.min(menu.x, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX);
  const top: number = Math.min(menu.y, window.innerHeight - MENU_HEIGHT_PX - VIEWPORT_MARGIN_PX);

  return {
    field,
    activeTab,
    handleSelectTab,
    handleDelete,
    position: {
      left: Math.max(VIEWPORT_MARGIN_PX, left),
      top: Math.max(VIEWPORT_MARGIN_PX, top),
      width: MENU_WIDTH_PX,
    },
  };
}
