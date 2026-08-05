import { catalogOptions } from "../../../../lib/mockCatalog/mockCatalog";
import type { CatalogOption } from "../../../../types/catalog";
import { RichTextView } from "../../../atoms/RichTextView/RichTextView";
import { PreviewSearchSelect } from "../PreviewSearchSelect/PreviewSearchSelect";
import {
  CHIP_ACTIVE_CLASSES,
  CHIP_BASE_CLASSES,
  CHIP_IDLE_CLASSES,
  CONTROL_BASE_CLASSES,
  CONTROL_IDLE_CLASSES,
  CONTROL_INVALID_CLASSES,
  OPTION_ROW_CLASSES,
} from "./PreviewFieldControl.constants";
import type { PreviewFieldControlProps } from "./PreviewFieldControl.types";
import { toggleInList, toInputValue, toSelectedList } from "./PreviewFieldControl.utils";

export function PreviewFieldControl({
  field,
  value,
  disabled,
  invalid,
  scopeValues,
  catalogBank,
  onChange,
}: PreviewFieldControlProps) {
  const controlClasses = `${CONTROL_BASE_CLASSES} ${invalid ? CONTROL_INVALID_CLASSES : CONTROL_IDLE_CLASSES}`;
  const options: CatalogOption[] = catalogOptions(field, scopeValues, catalogBank);
  const inputId = `preview-${field.name}`;

  switch (field.type) {
    case "rich_text":
      return <RichTextView content={field.content} />;

    case "label":
      return null;

    case "textarea":
      return (
        <textarea
          id={inputId}
          rows={3}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      );

    case "number":
    case "calculated":
      return (
        <input
          id={inputId}
          type="number"
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      );

    case "checkbox":
      return (
        <label className={OPTION_ROW_CLASSES}>
          <input
            type="checkbox"
            disabled={disabled}
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="accent-orange-500"
          />
          {field.title || "Acepto"}
        </label>
      );

    case "file":
      return (
        <input
          id={inputId}
          type="file"
          disabled={disabled}
          accept={field.fileConfig?.acceptedFormats.join(",")}
          onChange={(event) => onChange(event.target.files?.[0])}
          className={`${controlClasses} file:mr-2 file:rounded file:border-0 file:bg-surface-raised file:px-2 file:py-0.5 file:text-xs file:text-fg-soft`}
        />
      );

    // Un search_select existe porque su catalogo es demasiado grande para un desplegable: las 425
    // actividades por 15 repeticiones eran 6.375 <option> montados de entrada. El buscador tambien
    // es lo unico que puede mostrar codigo, descripcion y tarifa en columnas separadas.
    case "search_select":
      return (
        <PreviewSearchSelect
          inputId={inputId}
          label={field.label}
          options={options}
          value={value}
          disabled={disabled}
          invalid={invalid}
          onChange={onChange}
        />
      );

    case "select":
      return (
        <select
          id={inputId}
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        >
          <option value="">Seleccionar…</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "toggle_group":
      return (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(toInputValue(value) === option.id ? "" : option.id)}
              className={`${CHIP_BASE_CLASSES} ${
                toInputValue(value) === option.id ? CHIP_ACTIVE_CLASSES : CHIP_IDLE_CLASSES
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case "radio_group":
      return (
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <label key={option.id} className={OPTION_ROW_CLASSES}>
              <input
                type="radio"
                name={field.name}
                disabled={disabled}
                checked={toInputValue(value) === option.id}
                onChange={() => onChange(option.id)}
                className="accent-orange-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      );

    case "checkbox_group": {
      const selected: string[] = toSelectedList(value);

      return (
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <label key={option.id} className={OPTION_ROW_CLASSES}>
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected.includes(option.id)}
                onChange={() => onChange(toggleInList(selected, option.id))}
                className="accent-orange-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    default:
      return (
        <input
          id={inputId}
          type="text"
          disabled={disabled}
          value={toInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClasses}
        />
      );
  }
}
