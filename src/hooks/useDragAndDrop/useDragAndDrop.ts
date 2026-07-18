import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import { useFormStore } from "../../store/formStore";
import type { ActiveDrag } from "../../types/activeDrag";
import type { FieldTypeDef } from "../../types/fieldTypes";
import type { CanvasField, SavedComponent } from "../../types/storeTypes";
import { DRAG_ACTIVATION_DISTANCE_PX } from "./useDragAndDrop.constants";
import type { PendingToggleGroup } from "./useDragAndDrop.types";

export function useDragAndDrop() {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const addSavedComponentToRow = useFormStore((state) => state.addSavedComponentToRow);
  const moveField = useFormStore((state) => state.moveField);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingToggleGroup, setPendingToggleGroup] = useState<PendingToggleGroup | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
  );

  function handleDragStart(event: DragStartEvent): void {
    const data = event.active.data.current;
    if (data?.source === "palette") {
      setActiveDrag({ source: "palette", fieldType: data.fieldType as FieldTypeDef });
    } else if (data?.source === "library") {
      setActiveDrag({ source: "library", component: data.component as SavedComponent });
    } else if (data?.source === "canvas-field") {
      setActiveDrag({ source: "canvas-field", field: data.field as CanvasField });
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const overData = over.data.current as { rowId?: string; fieldId?: string } | undefined;
    const targetRowId = overData?.rowId;
    if (!targetRowId) return;

    const data = active.data.current;
    if (data?.source === "palette") {
      const fieldType = data.fieldType as FieldTypeDef;
      if (fieldType.type === "toggle_group") {
        setPendingToggleGroup({ rowId: targetRowId, fieldType });
      } else {
        addFieldToRow(targetRowId, fieldType);
      }
    } else if (data?.source === "library") {
      const component = data.component as SavedComponent;
      addSavedComponentToRow(targetRowId, component.id);
    } else if (data?.source === "canvas-field") {
      if (active.id === over.id) return;
      const field = data.field as CanvasField;
      moveField(field.id, targetRowId, overData?.fieldId);
    }
  }

  function confirmToggleGroup(config: { title?: string; optionCount: number }): void {
    if (!pendingToggleGroup) return;
    addFieldToRow(pendingToggleGroup.rowId, pendingToggleGroup.fieldType, config);
    setPendingToggleGroup(null);
  }

  function cancelToggleGroup(): void {
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
