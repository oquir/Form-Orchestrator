import { Check, Save22 } from "reicon-react";
import { useSaveButton } from "../../../hooks/useSaveButton/useSaveButton";

export function SaveButton() {
  const { lastSavedAt, justSaved, handleSave } = useSaveButton();

  return (
    <div className="flex items-center gap-2">
      {lastSavedAt && !justSaved && (
        <span className="text-xs text-slate-400 dark:text-neutral-500">
          Guardado {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      )}
      <button
        type="button"
        onClick={handleSave}
        className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
          justSaved
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:cursor-not-allowed"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-neutral-100 hover:cursor-pointer"
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
