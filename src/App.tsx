import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import "./index.css";
import { AppLayout } from "./components/layout/AppLayout";
import { DragPreview } from "./components/molecules/DragPreview/DragPreview";
import { AddOptionsFieldModal } from "./components/organisms/AddOptionsFieldModal/AddOptionsFieldModal";
import { Canvas } from "./components/organisms/Canvas/Canvas";
import { DraftRecoveryModal } from "./components/organisms/DraftRecoveryModal/DraftRecoveryModal";
import { SetupWizardModal } from "./components/organisms/SetupWizardModal/SetupWizardModal";
import { Sidebar } from "./components/organisms/Sidebar/Sidebar";
import { useAutosave } from "./hooks/useAutosave/useAutosave";
import { useDragAndDrop } from "./hooks/useDragAndDrop/useDragAndDrop";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts/useKeyboardShortcuts";
import { clearDraft, loadDraft } from "./lib/persistence/persistence";
import { useFormStore } from "./store/formStore";
import type { DraftPayload } from "./types/persistenceTypes";

function App() {
  const restoreDraft = useFormStore((state) => state.restoreDraft);
  const isSetupComplete = useFormStore((state) => state.setupConfig.isComplete);
  const isDarkMode = useFormStore((state) => state.isDarkMode);
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null | undefined>(undefined);
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

  useAutosave();
  useKeyboardShortcuts();

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

export default App;
