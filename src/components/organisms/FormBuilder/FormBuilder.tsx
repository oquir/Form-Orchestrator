import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop/useDragAndDrop";
import { AppLayout } from "../../layout/AppLayout";
import { DragPreview } from "../../molecules/DragPreview/DragPreview";
import { AddOptionsFieldModal } from "../AddOptionsFieldModal/AddOptionsFieldModal";
import { Canvas } from "../Canvas/Canvas";
import { Sidebar } from "../Sidebar/Sidebar";

export function FormBuilder() {
  const {
    sensors,
    activeDrag,
    pendingOptionsField,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    confirmOptionsField,
    cancelOptionsField,
  } = useDragAndDrop();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AppLayout sidebar={<Sidebar />} canvas={<Canvas />} />
      {pendingOptionsField && (
        <AddOptionsFieldModal
          fieldTypeLabel={pendingOptionsField.fieldType.label}
          onCancel={cancelOptionsField}
          onConfirm={confirmOptionsField}
        />
      )}
      <DragOverlay>{activeDrag ? <DragPreview activeDrag={activeDrag} /> : null}</DragOverlay>
    </DndContext>
  );
}
