import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import "./index.css";
import { AppLayout } from "./components/layout/AppLayout";
import { Canvas } from "./components/organisms/Canvas";
import { DraftRecoveryModal } from "./components/organisms/DraftRecoveryModal";
import { SetupWizardModal } from "./components/organisms/SetupWizardModal";
import { Sidebar } from "./components/organisms/Sidebar";
import { useAutosave } from "./hooks/useAutosave";
import type { FieldTypeDef } from "./lib/fieldTypes";
import type { DraftPayload } from "./lib/persistence";
import { clearDraft, loadDraft } from "./lib/persistence";
import type { SavedComponent } from "./store/formStore";
import { useFormStore } from "./store/formStore";

type ActiveDrag =
  | { source: "palette"; fieldType: FieldTypeDef }
  | { source: "library"; component: SavedComponent };

function App() {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const addSavedComponentToRow = useFormStore((state) => state.addSavedComponentToRow);
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  const isSetupComplete = useFormStore((state) => state.setupConfig.isComplete);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null | undefined>(undefined);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const isDarkMode = useFormStore((state) => state.isDarkMode);

  useAutosave();

  useEffect(() => {
    setPendingDraft(loadDraft());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  if (pendingDraft === undefined) {
    return null;
  }

  if (pendingDraft) {
    return (
      <DraftRecoveryModal
        draft={pendingDraft}
        onRestore={() => {
          restoreDraft(pendingDraft);
          setPendingDraft(null);
        }}
        onDiscard={() => {
          clearDraft();
          setPendingDraft(null);
        }}
      />
    );
  }

  if (!isSetupComplete) {
    return <SetupWizardModal />;
  }

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
      addFieldToRow(over.id as string, data.fieldType as FieldTypeDef);
    } else if (data?.source === "library") {
      const component = data.component as SavedComponent;
      addSavedComponentToRow(over.id as string, component.id);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AppLayout sidebar={<Sidebar />} canvas={<Canvas />} />
      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-lg">
            {activeDrag.source === "palette"
              ? activeDrag.fieldType.label
              : activeDrag.component.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
