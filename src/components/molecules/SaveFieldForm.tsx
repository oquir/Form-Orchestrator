import { useState } from "react";
import { useFormStore } from "../../store/formStore";
import { Button } from "../atoms/Button";

interface SaveFieldFormProps {
  fieldId: string;
  label: string;
  containerClassName?: string;
  showSuccessMessage?: boolean;
}

export function SaveFieldForm({
  fieldId,
  label,
  containerClassName = "",
  showSuccessMessage = false,
}: SaveFieldFormProps) {
  const saveFieldAsComponent = useFormStore((state) => state.saveFieldAsComponent);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    saveFieldAsComponent(fieldId, name.trim());
    setName("");
    setSaved(true);
  }

  return (
    <div className={containerClassName}>
      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-neutral-400">{label}</p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          placeholder="Nombre del componente"
          className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-orange-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-orange-400"
        />
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="shrink-0 px-3 py-1.5 text-xs"
        >
          Guardar
        </Button>
      </div>
      {showSuccessMessage && saved && (
        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          Guardado en el Almacén.
        </p>
      )}
    </div>
  );
}
