import { useFormStore } from "../../../../store/formStore";
import { FILE_FORMAT_PRESETS } from "./FileOptionsEditor.constants";
import type { FileOptionsEditorProps } from "./FileOptionsEditor.types";
import { togglePreset } from "./FileOptionsEditor.utils";

export function FileOptionsEditor({ field }: FileOptionsEditorProps) {
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
            const isActive = preset.tokens.every((token) => config.acceptedFormats.includes(token));
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
