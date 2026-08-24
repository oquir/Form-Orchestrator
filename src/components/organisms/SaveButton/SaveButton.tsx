import { Check, Save22 } from "reicon-react";
import { useSaveButton } from "../../../hooks/useSaveButton/useSaveButton";

export function SaveButton() {
  const { lastSavedAt, justSaved, handleSave } = useSaveButton();

  return (
    // El sello de hora va debajo, nunca al lado: a la izquierda del boton lo hacia saltar de sitio
    // cada vez que aparecia o desaparecia al alternar justSaved.
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSave}
        className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
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
            <Save22 size={14} /> Guardar
          </>
        )}
      </button>
      {lastSavedAt && !justSaved && (
        <span className="text-center text-[11px] text-slate-400 dark:text-neutral-500">
          Guardado {new Date(lastSavedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
