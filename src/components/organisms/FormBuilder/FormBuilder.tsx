import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop/useDragAndDrop";
import { useFormStore } from "../../../store/formStore";
import { AppLayout } from "../../layout/AppLayout";
import { DragPreview } from "../../molecules/DragPreview/DragPreview";
import { Canvas } from "../Canvas/Canvas";
import { FormSimulator } from "../FormSimulator/FormSimulator";
import { Sidebar } from "../Sidebar/Sidebar";

const OVERLAY_STYLE: CSSProperties = { width: "auto", height: "auto" };

export function FormBuilder() {
  const { sensors, activeDrag, overlayModifiers, handleDragStart, handleDragMove, handleDragEnd } =
    useDragAndDrop();
  const isSimulatorOpen = useFormStore((state) => state.isSimulatorOpen);

  // El simulador se lleva la pantalla entera: sin sidebar, sin lienzo y sin drag and drop.
  if (isSimulatorOpen) return <FormSimulator />;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AppLayout sidebar={<Sidebar />} canvas={<Canvas />} />
      <DragOverlay modifiers={overlayModifiers} style={OVERLAY_STYLE}>
        {activeDrag ? <DragPreview activeDrag={activeDrag} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
