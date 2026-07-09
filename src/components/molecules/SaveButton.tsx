import { useEffect, useRef, useState } from "react";
import { Check, Save22 } from "reicon-react";
import { saveDraft } from "../../lib/persistence";
import { useFormStore } from "../../store/formStore";

export function SaveButton() {
  const markSaved = useFormStore((state) => state.markSaved);
  const lastSavedAt = useFormStore((state) => state.lastSavedAt);
  const [justSaved, setJustSaved] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  function handleSave() {
    const { formSteps, introModal, savedComponents, setupConfig } = useFormStore.getState();
    saveDraft({ formSteps, introModal, savedComponents, setupConfig });
    markSaved();
    setJustSaved(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setJustSaved(false), 2000);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {lastSavedAt && !justSaved && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Guardado {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      )}
      <button
        type="button"
        onClick={handleSave}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
          justSaved
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:cursor-not-allowed"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100 hover:cursor-pointer"
        }`}
      >
        {justSaved ? (
          <>
            <Check size={14} weight="Filled" /> Guardado
          </>
        ) : (
          <>
            <Save22 size={14} /> Guardar cambios
          </>
        )}
      </button>
    </div>
  );
}
