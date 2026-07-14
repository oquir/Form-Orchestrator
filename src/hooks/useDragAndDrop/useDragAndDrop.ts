import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import { useFormStore } from "../../store/formStore";
import type { ActiveDrag } from "../../types/activeDrag";
import type { FieldTypeDef } from "../../types/fieldTypes";
import type { SavedComponent } from "../../types/storeTypes";
import { DRAG_ACTIVATION_DISTANCE_PX } from "./useDragAndDrop.constants";
import type { PendingToggleGroup } from "./useDragAndDrop.types";

export function useDragAndDrop() {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const addSavedComponentToRow = useFormStore((state) => state.addSavedComponentToRow);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingToggleGroup, setPendingToggleGroup] = useState<PendingToggleGroup | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.source === "palette") {
      setActiveDrag({ source: "palette", fieldType: data.fieldType as FieldTypeDef });
    } else if (data?.source === "library") {
      setActiveDrag({ source: "library", component: data.component as SavedComponent });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    if (data?.source === "palette") {
      const fieldType = data.fieldType as FieldTypeDef;
      if (fieldType.type === "toggle_group") {
        setPendingToggleGroup({ rowId: over.id as string, fieldType });
      } else {
        addFieldToRow(over.id as string, fieldType);
      }
    } else if (data?.source === "library") {
      const component = data.component as SavedComponent;
      addSavedComponentToRow(over.id as string, component.id);
    }
  }

  function confirmToggleGroup(config: { title?: string; optionCount: number }) {
    if (!pendingToggleGroup) return;
    addFieldToRow(pendingToggleGroup.rowId, pendingToggleGroup.fieldType, config);
    setPendingToggleGroup(null);
  }

  function cancelToggleGroup() {
    setPendingToggleGroup(null);
  }

  return {
    sensors,
    activeDrag,
    pendingToggleGroup,
    handleDragStart,
    handleDragEnd,
    confirmToggleGroup,
    cancelToggleGroup,
  };
}
