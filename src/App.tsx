import "./index.css";
import { DraftRecoveryModal } from "./components/organisms/DraftRecoveryModal/DraftRecoveryModal";
import { FormBuilder } from "./components/organisms/FormBuilder/FormBuilder";
import { SetupWizardModal } from "./components/organisms/SetupWizardModal/SetupWizardModal";
import { useAutosave } from "./hooks/useAutosave/useAutosave";
import { useDraftRecovery } from "./hooks/useDraftRecovery/useDraftRecovery";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts/useKeyboardShortcuts";
import { useThemeClass } from "./hooks/useThemeClass/useThemeClass";
import { useFormStore } from "./store/formStore";
import type { DraftRecovery } from "./types/draftRecovery";

function App() {
  const isSetupComplete = useFormStore((state) => state.setupConfig.isComplete);
  const draftRecovery: DraftRecovery = useDraftRecovery();

  useThemeClass();
  useAutosave();
  useKeyboardShortcuts();

  if (draftRecovery.status === "loading") {
    return null;
  }

  if (draftRecovery.draft) {
    return (
      <DraftRecoveryModal
        draft={draftRecovery.draft}
        onRestore={draftRecovery.restore}
        onDiscard={draftRecovery.discard}
      />
    );
  }

  if (!isSetupComplete) {
    return <SetupWizardModal />;
  }

  return <FormBuilder />;
}

export default App;
