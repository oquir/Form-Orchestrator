import { DndContext, DragOverlay } from "@dnd-kit/core";
import { lazy, Suspense } from "react";
import { useDragAndDrop } from "../../../hooks/useDragAndDrop/useDragAndDrop";
import { useFormStore } from "../../../store/formStore";
import { SimulatorLoading } from "../../atoms/SimulatorLoading/SimulatorLoading";
import { AppLayout } from "../../layout/AppLayout";
import { DragPreview } from "../../molecules/DragPreview/DragPreview";
import { Canvas } from "../Canvas/Canvas";
import { RightSidebar } from "../RightSidebar/RightSidebar";
import { Sidebar } from "../Sidebar/Sidebar";
import { OVERLAY_STYLE } from "./FormBuilder.constants";

// El simulador se carga aparte: es la unica puerta a los catalogos de mentira y al zod que hidrata
// los esquemas, que juntos pesan mas que el resto de la app y no sirven para nada hasta que alguien
// abre el simulador. La frontera solo corta si nada del builder importa ese subarbol.
const FormSimulator = lazy(() =>
  import("../FormSimulator/FormSimulator").then((module) => ({ default: module.FormSimulator })),
);

export function FormBuilder() {
  const {
    sensors,
    activeDrag,
    collisionDetection,
    overlayModifiers,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useDragAndDrop();
  const isSimulatorOpen = useFormStore((state) => state.isSimulatorOpen);

  // El simulador se lleva la pantalla entera: sin sidebar, sin lienzo y sin drag and drop.
  if (isSimulatorOpen) {
    return (
      <Suspense fallback={<SimulatorLoading />}>
        <FormSimulator />
      </Suspense>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <AppLayout sidebar={<Sidebar />} canvas={<Canvas />} rightSidebar={<RightSidebar />} />
      {/* Sin animacion de caida para una fila: dnd-kit la devuelve volando al sitio donde empezo,
          que ya no es el suyo. El hueco se abrio antes, asi que la fila ya esta donde toca. */}
      <DragOverlay
        modifiers={overlayModifiers}
        style={OVERLAY_STYLE}
        dropAnimation={activeDrag?.source === "canvas-row" ? null : undefined}
      >
        {activeDrag ? <DragPreview activeDrag={activeDrag} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
