import { useState } from "react";
import { useFormStore } from "../../../store/formStore";
import { LabeledInput } from "../LabeledInput/LabeledInput";
import type { FieldNameInputProps } from "./FieldNameInput.types";

export function FieldNameInput({ field }: FieldNameInputProps) {
  const setFieldName = useFormStore((state) => state.setFieldName);
  const [draft, setDraft] = useState<string | null>(null);

  function commit(): void {
    if (draft === null) return;
    if (draft.trim().length > 0) setFieldName(field.id, draft);
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-1">
      <LabeledInput
        id="field-name"
        label="Nombre técnico"
        value={draft ?? field.name}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        spellCheck={false}
      />
      <p className="text-[11px] text-slate-400 dark:text-neutral-500">
        Con este nombre lo referencian las fórmulas y el formulario generado. Se normaliza a
        minúsculas con guiones bajos y se desambigua si ya existe.
      </p>
    </div>
  );
}
