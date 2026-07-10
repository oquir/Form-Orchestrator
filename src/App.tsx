import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import "./index.css";
import { AppLayout } from "./components/layout/AppLayout";
import { AddToggleGroupModal } from "./components/organisms/AddToggleGroupModal/AddToggleGroupModal";
import { Canvas } from "./components/organisms/Canvas/Canvas";
import { DraftRecoveryModal } from "./components/organisms/DraftRecoveryModal/DraftRecoveryModal";
import { SetupWizardModal } from "./components/organisms/SetupWizardModal/SetupWizardModal";
import { Sidebar } from "./components/organisms/Sidebar/Sidebar";
import { useAutosave } from "./hooks/useAutosave";
import { clearDraft, loadDraft } from "./lib/persistence";
import { useFormStore } from "./store/formStore";
import type { ActiveDrag } from "./types/activeDrag";
import type { FieldTypeDef } from "./types/fieldTypes";
import type { DraftPayload } from "./types/persistenceTypes";
import type { SavedComponent } from "./types/storeTypes";

function App() {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const addSavedComponentToRow = useFormStore((state) => state.addSavedComponentToRow);
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  const isSetupComplete = useFormStore((state) => state.setupConfig.isComplete);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null | undefined>(undefined);
  const [pendingToggleGroup, setPendingToggleGroup] = useState<{
    rowId: string;
    fieldType: FieldTypeDef;
  } | null>(null);
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

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <AppLayout sidebar={<Sidebar />} canvas={<Canvas />} />
      {pendingToggleGroup && (
        <AddToggleGroupModal
          onCancel={() => setPendingToggleGroup(null)}
          onConfirm={({ title, optionCount }) => {
            addFieldToRow(pendingToggleGroup.rowId, pendingToggleGroup.fieldType, {
              title,
              optionCount,
            });
            setPendingToggleGroup(null);
          }}
        />
      )}
      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-md border border-orange-500 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-lg dark:bg-neutral-800 dark:text-neutral-200">
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
