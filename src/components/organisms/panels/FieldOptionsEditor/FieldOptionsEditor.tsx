import { Xmark } from "reicon-react";
import { useFormStore } from "../../../../store/formStore";
import type { FieldOption } from "../../../../types/field";
import { IconButton } from "../../../atoms/IconButton/IconButton";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import {
  MIN_OPTIONS,
  OPTION_INPUT_CLASSES,
  REMOVE_OPTION_CLASSES,
} from "./FieldOptionsEditor.constants";
import type { FieldOptionsEditorProps } from "./FieldOptionsEditor.types";
import { getOptionsHint } from "./FieldOptionsEditor.utils";

export function FieldOptionsEditor({ field }: FieldOptionsEditorProps) {
  const updateField = useFormStore((state) => state.updateField);
  const addFieldOption = useFormStore((state) => state.addFieldOption);
  const removeFieldOption = useFormStore((state) => state.removeFieldOption);
  const updateFieldOptionLabel = useFormStore((state) => state.updateFieldOptionLabel);
  const options: FieldOption[] = field.options ?? [];
  const canRemove: boolean = options.length > MIN_OPTIONS;

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-neutral-700">
      <LabeledInput
        id="field-options-title"
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
              <label className="sr-only" htmlFor={`field-option-${option.id}`}>
                Opción {index + 1}
              </label>
              <input
                id={`field-option-${option.id}`}
                type="text"
                value={option.label}
                onChange={(event) =>
                  updateFieldOptionLabel(field.id, option.id, event.target.value)
                }
                className={OPTION_INPUT_CLASSES}
              />
              <IconButton
                onClick={() => removeFieldOption(field.id, option.id)}
                disabled={!canRemove}
                title={
                  canRemove
                    ? `Eliminar opción ${index + 1}`
                    : `Debe haber al menos ${MIN_OPTIONS} opciones`
                }
                className={REMOVE_OPTION_CLASSES}
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
        {getOptionsHint(field.type, Boolean(field.validations.required))}
      </p>
    </div>
  );
}
