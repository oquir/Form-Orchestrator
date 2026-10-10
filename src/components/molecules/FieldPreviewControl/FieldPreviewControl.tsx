import type { ReactNode } from "react";
import {
  AngleDown2,
  AngleUp2,
  Calculator,
  Calendar,
  CloudUpload,
  Database,
  Envelope,
  Magnifier,
  Phone,
} from "reicon-react";
import { affixOf } from "../../../lib/fieldAffix/fieldAffix";
import { phoneKindOf } from "../../../lib/fieldContact/fieldContact";
import { showsOptionsInline } from "../../../lib/fieldOptions/fieldOptions";
import { placeholderOf } from "../../../lib/fieldPlaceholder/fieldPlaceholder";
import type { CanvasField, FieldOption } from "../../../types/field";
import { RichTextView } from "../../atoms/RichTextView/RichTextView";
import {
  AFFIX_CLASSES,
  CHECKBOX_CLASSES,
  CHECKBOX_ON_CLASSES,
  DROPZONE_CLASSES,
  GHOST_CHIP_CLASSES,
  GHOST_NOTE_TEXT,
  GHOST_NOTE_TITLE,
  GHOST_TILE_CLASSES,
  GROUP_TITLE_CLASSES,
  INPUT_CLASSES,
  OPTION_INLINE_CLASSES,
  OPTION_LIST_CLASSES,
  OPTION_ROW_CLASSES,
  PHONE_SAMPLES,
  PLACEHOLDER_OPTION_CLASSES,
  RADIO_CLASSES,
  RADIO_ON_CLASSES,
  READONLY_INPUT_CLASSES,
  SELECT_CHEVRON_CLASSES,
  SELECT_NOTE_TEXT,
  SPINNER_CLASSES,
  TEXTAREA_CLASSES,
  TILE_CLASSES,
  TILE_ON_CLASSES,
  TILE_ROW_CLASSES,
} from "./FieldPreviewControl.constants";
import type {
  FieldPreviewControlProps,
  OptionsNote,
  PreviewOptions,
} from "./FieldPreviewControl.types";
import { dateMockText, previewOptions } from "./FieldPreviewControl.utils";

function withFrame(title: string | undefined, control: ReactNode) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {title && <p className={GROUP_TITLE_CLASSES}>{title}</p>}
      {control}
    </div>
  );
}

// De donde salen las opciones, como una ficha punteada mas al final de la fila. Primero fue un
// recuadro que reemplazaba al control -- y todos los tipos de opciones se veian iguales -- y despues
// un renglon aparte, que cortaba el control. Los select lo dicen en su propio texto.
function ghostNote(note: OptionsNote, classes: string) {
  return (
    <span title={GHOST_NOTE_TITLE[note]} className={classes}>
      {note === "catalog" && <Database size={11} className="shrink-0" />}
      <span className="truncate">{GHOST_NOTE_TEXT[note]}</span>
    </span>
  );
}

function optionLabel(option: FieldOption, isPlaceholder: boolean) {
  return (
    <span className={isPlaceholder ? PLACEHOLDER_OPTION_CLASSES : "truncate"}>{option.label}</span>
  );
}

// El texto de muestra entre el prefijo y el sufijo, apagados como en el simulador.
function withAffixes(field: CanvasField, sample: string) {
  const prefix: string | undefined = affixOf(field, "prefix");
  const suffix: string | undefined = affixOf(field, "suffix");

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {prefix && <span className={AFFIX_CLASSES}>{prefix}</span>}
      <span className="truncate">{sample}</span>
      {suffix && <span className={AFFIX_CLASSES}>{suffix}</span>}
    </span>
  );
}

// Un trazo fino y no el Check de la libreria, que a este tamano se ve como una mancha.
function checkMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
      <path
        d="M2.5 6.5 5 9l4.5-5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FieldPreviewControl({ field }: FieldPreviewControlProps) {
  const options: PreviewOptions = previewOptions(field);
  // Si el autor puso un placeholder, el lienzo muestra ese en vez del texto de muestra del tipo.
  const placeholder: string | undefined = placeholderOf(field);

  switch (field.type) {
    case "label":
      return null;

    case "rich_text":
      return <RichTextView content={field.content} />;

    case "select":
      return (
        <div className={INPUT_CLASSES}>
          <span className="truncate">
            {placeholder ?? (options.note ? SELECT_NOTE_TEXT[options.note] : "Seleccionar…")}
          </span>
          <span className={SELECT_CHEVRON_CLASSES}>
            <AngleDown2 size={14} />
          </span>
        </div>
      );

    case "search_select":
      return withFrame(
        field.title,
        <div className={INPUT_CLASSES}>
          <span className="flex min-w-0 items-center gap-2">
            <Magnifier size={14} className="shrink-0 text-fg-muted" />
            <span className="truncate">
              {placeholder ??
                (options.note ? SELECT_NOTE_TEXT[options.note] : "Buscar y seleccionar…")}
            </span>
          </span>
          <span className={SELECT_CHEVRON_CLASSES}>
            <AngleDown2 size={14} />
          </span>
        </div>,
      );

    // Siempre en linea en el lienzo, tenga o no inlineOptions: en columna se confundia con una lista
    // de checkboxes.
    case "radio_group":
      return withFrame(
        field.title,
        <div className={OPTION_INLINE_CLASSES}>
          {options.items.map((option, index) => (
            <span key={option.id} className={OPTION_ROW_CLASSES}>
              <span className={index === 0 ? RADIO_ON_CLASSES : RADIO_CLASSES}>
                {index === 0 && <span className="h-2 w-2 rounded-full bg-brand" />}
              </span>
              {optionLabel(option, options.isPlaceholder)}
            </span>
          ))}
          {options.note && ghostNote(options.note, GHOST_CHIP_CLASSES)}
        </div>,
      );

    case "checkbox_group":
      return withFrame(
        field.title,
        <div className={showsOptionsInline(field) ? OPTION_INLINE_CLASSES : OPTION_LIST_CLASSES}>
          {options.items.map((option, index) => (
            <span key={option.id} className={OPTION_ROW_CLASSES}>
              <span className={index === 0 ? CHECKBOX_ON_CLASSES : CHECKBOX_CLASSES}>
                {index === 0 && checkMark()}
              </span>
              {optionLabel(option, options.isPlaceholder)}
            </span>
          ))}
          {options.note && ghostNote(options.note, GHOST_CHIP_CLASSES)}
        </div>,
      );

    case "toggle_group":
      return withFrame(
        field.title,
        <>
          <div className={TILE_ROW_CLASSES}>
            {options.items.map((option, index) => (
              <span key={option.id} className={index === 0 ? TILE_ON_CLASSES : TILE_CLASSES}>
                {option.label}
              </span>
            ))}
            {options.note && ghostNote(options.note, GHOST_TILE_CLASSES)}
          </div>
          {!field.validations.required && (
            <p className="text-[11px] text-fg-subtle underline decoration-dotted">
              Limpiar selección
            </p>
          )}
        </>,
      );

    case "checkbox":
      return (
        <span className={OPTION_ROW_CLASSES}>
          <span className={CHECKBOX_CLASSES} />
          <span className="truncate">{field.title || "Marcar opción"}</span>
        </span>
      );

    case "textarea":
      return (
        <div className={TEXTAREA_CLASSES}>
          <span>{placeholder ?? "Escribe aquí…"}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            className="absolute right-1 bottom-1 h-2.5 w-2.5 text-fg-subtle"
          >
            <path
              d="M9 1 1 9M9 5 5 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case "number":
      return (
        <div className={INPUT_CLASSES}>
          {withAffixes(field, placeholder ?? "0")}
          <span className={SPINNER_CLASSES}>
            <AngleUp2 size={10} />
            <AngleDown2 size={10} />
          </span>
        </div>
      );

    case "calculated":
      return (
        <div className={READONLY_INPUT_CLASSES}>
          {withAffixes(field, placeholder ?? "Valor calculado")}
          <Calculator size={14} className="shrink-0" />
        </div>
      );

    case "tel":
      return (
        <div className={INPUT_CLASSES}>
          <span className="truncate">{placeholder ?? PHONE_SAMPLES[phoneKindOf(field)]}</span>
          <Phone size={14} className="shrink-0 text-fg-muted" />
        </div>
      );

    case "email":
      return (
        <div className={INPUT_CLASSES}>
          <span className="truncate">{placeholder ?? "correo@ejemplo.com"}</span>
          <Envelope size={14} className="shrink-0 text-fg-muted" />
        </div>
      );

    case "date":
      return (
        <div className={INPUT_CLASSES}>
          <span className="truncate">{dateMockText(field)}</span>
          <Calendar size={14} className="shrink-0 text-fg-muted" />
        </div>
      );

    case "file": {
      const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 };
      const formats: string =
        config.acceptedFormats.length > 0 ? config.acceptedFormats.join(", ") : "Cualquier formato";

      return (
        <div className={DROPZONE_CLASSES}>
          <CloudUpload size={18} className="text-fg-muted" />
          <span className="text-xs font-medium text-fg-soft">Subir archivo</span>
          <span className="max-w-full truncate text-[10px] text-fg-subtle">
            {formats} · Máx {config.maxSizeMB} MB
          </span>
        </div>
      );
    }

    default:
      return (
        <div className={INPUT_CLASSES}>
          <span className="truncate">{placeholder ?? "Texto de ejemplo"}</span>
        </div>
      );
  }
}
