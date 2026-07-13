import { Xmark } from "reicon-react";
import { findRowContainingField, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { IconButton } from "../../../atoms/IconButton/IconButton";
import { LabeledInput } from "../../../molecules/LabeledInput/LabeledInput";
import { LabeledRangeSlider } from "../../../molecules/LabeledRangeSlider/LabeledRangeSlider";

function ToggleGroupOptionsEditor({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);
  const addFieldOption = useFormStore((state) => state.addFieldOption);
  const removeFieldOption = useFormStore((state) => state.removeFieldOption);
  const updateFieldOptionLabel = useFormStore((state) => state.updateFieldOptionLabel);
  const options = field.options ?? [];

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-neutral-700">
      <LabeledInput
        id="field-toggle-title"
        label="Título del grupo (opcional)"
        value={field.title ?? ""}
        onChange={(event) => updateField(field.id, { title: event.target.value })}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-neutral-200">Opciones</p>
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
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
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addFieldOption(field.id)}
          className="mt-2 text-xs font-medium text-orange-600 hover:cursor-pointer hover:text-orange-500 dark:text-orange-500 dark:hover:text-orange-400"
        >
          + Agregar opción
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-neutral-500">
        {field.validations.required
          ? "Campo requerido: siempre quedará una opción seleccionada."
          : 'Campo opcional: se mostrará un botón de "Limpiar selección".'}
      </p>
    </div>
  );
}

export function AttributesPanel({ field }: { field: CanvasField }) {
  const updateField = useFormStore((state) => state.updateField);
  const rowColumns = useFormStore(
    (state) => findRowContainingField(state, field.id)?.columns ?? 16,
  );

  return (
    <div className="flex flex-col gap-4">
      <LabeledInput id="field-type" label="Tipo" value={field.type} disabled />

      <LabeledInput
        id="field-label"
        label="Etiqueta"
        value={field.label}
        onChange={(event) => updateField(field.id, { label: event.target.value })}
      />

      <LabeledRangeSlider
        id="field-colspan"
        label={`Columnas (${field.colSpan}/${rowColumns})`}
        min={1}
        max={rowColumns}
        value={field.colSpan}
        onChange={(value) => updateField(field.id, { colSpan: value })}
      />

      {field.type === "toggle_group" && <ToggleGroupOptionsEditor field={field} />}
      {field.type === "file" && <FileOptionsEditor field={field} />}
    </div>
  );
}

const FILE_FORMAT_PRESETS: { id: string; label: string; tokens: string[] }[] = [
  { id: "images", label: "Imágenes", tokens: ["image/*"] },
  { id: "pdf", label: "PDF", tokens: [".pdf"] },
  { id: "excel", label: "Excel", tokens: [".xls", ".xlsx"] },
  { id: "word", label: "Word", tokens: [".doc", ".docx"] },
  { id: "csv", label: "CSV", tokens: [".csv"] },
  { id: "xml", label: "XML", tokens: [".xml"] },
  { id: "zip", label: "ZIP/RAR", tokens: [".zip", ".rar"] },
  { id: "txt", label: "Texto", tokens: [".txt"] },
];

function togglePreset(current: string[], tokens: string[]): string[] {
  const isActive = tokens.every((token) => current.includes(token));
  if (isActive) return current.filter((token) => !tokens.includes(token));
  const missing = tokens.filter((token) => !current.includes(token));
  return [...current, ...missing];
}

function FileOptionsEditor({ field }: { field: CanvasField }) {
  const updateFieldFileConfig = useFormStore((state) => state.updateFieldFileConfig);
  const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 };
  const formatsText = config.acceptedFormats.join(", ");

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-neutral-700">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="field-file-formats"
          className="text-xs font-medium text-slate-600 dark:text-neutral-300"
        >
          Formatos permitidos
        </label>

        <div className="flex flex-wrap gap-1.5">
          {FILE_FORMAT_PRESETS.map((preset) => {
            const isActive = preset.tokens.every((token) =>
              config.acceptedFormats.includes(token),
            );
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  updateFieldFileConfig(field.id, {
                    acceptedFormats: togglePreset(config.acceptedFormats, preset.tokens),
                  })
                }
                title={preset.tokens.join(", ")}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors hover:cursor-pointer ${
                  isActive
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <input
          id="field-file-formats"
          type="text"
          placeholder="image/*, .pdf, application/zip"
          value={formatsText}
          onChange={(event) => {
            const next = event.target.value
              .split(",")
              .map((token) => token.trim())
              .filter(Boolean);
            updateFieldFileConfig(field.id, { acceptedFormats: next });
          }}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        />
        <p className="text-[10px] text-slate-400 dark:text-neutral-500">
          Tocá los presets o editá manualmente (MIME, extensión o wildcard). Vacío = todos.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="field-file-maxsize"
          className="text-xs font-medium text-slate-600 dark:text-neutral-300"
        >
          Peso máximo (MB)
        </label>
        <input
          id="field-file-maxsize"
          type="number"
          min={1}
          value={config.maxSizeMB}
          onChange={(event) => {
            const parsed = Number.parseFloat(event.target.value);
            if (Number.isNaN(parsed) || parsed <= 0) return;
            updateFieldFileConfig(field.id, { maxSizeMB: parsed });
          }}
          className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        />
      </div>
    </div>
  );
}
