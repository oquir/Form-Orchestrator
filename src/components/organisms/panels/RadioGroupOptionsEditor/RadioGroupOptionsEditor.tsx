import { Xmark } from "reicon-react";
import { useFormStore } from "../../../../store/formStore";
import type { FieldOption } from "../../../../types/storeTypes";
import { IconButton } from "../../../atoms/IconButton/IconButton";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import type { RadioGroupOptionsEditorProps } from "./RadioGroupOptionsEditor.types";

export function RadioGroupOptionsEditor({ field }: RadioGroupOptionsEditorProps) {
  const updateField = useFormStore((state) => state.updateField);
  const addFieldOption = useFormStore((state) => state.addFieldOption);
  const removeFieldOption = useFormStore((state) => state.removeFieldOption);
  const updateFieldOptionLabel = useFormStore((state) => state.updateFieldOptionLabel);
  const options: FieldOption[] = field.options ?? [];

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-neutral-700">
      <LabeledInput
        id="field-radio-title"
        label="Título del grupo (opcional)"
        value={field.title ?? ""}
        onChange={(event) => updateField(field.id, { title: event.target.value })}
      />

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium text-slate-700 dark:text-neutral-200">
          Opciones
        </legend>
        <ul className="flex list-none flex-col gap-2">
          {options.map((option, index) => (
            <li key={option.id} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`radio-option-${option.id}`}>
                Opción {index + 1}
              </label>
              <input
                id={`radio-option-${option.id}`}
                type="text"
                value={option.label}
                onChange={(event) =>
                  updateFieldOptionLabel(field.id, option.id, event.target.value)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              />
              <IconButton
                onClick={() => removeFieldOption(field.id, option.id)}
                disabled={options.length <= 2}
                title={
                  options.length <= 2
                    ? "Debe haber al menos 2 opciones"
                    : `Eliminar opción ${index + 1}`
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-500 dark:hover:border-red-400 dark:hover:text-red-400"
              >
                <Xmark size={12} weight="Filled" />
              </IconButton>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => addFieldOption(field.id)}
          className="mt-2 text-xs font-medium text-orange-600 hover:cursor-pointer hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400"
        >
          + Agregar opción
        </button>
      </fieldset>

      <p className="text-xs text-slate-400 dark:text-neutral-500">
        Una vez marcada una opción no se puede deseleccionar, a diferencia de los Toggle Buttons.
      </p>
    </div>
  );
}
