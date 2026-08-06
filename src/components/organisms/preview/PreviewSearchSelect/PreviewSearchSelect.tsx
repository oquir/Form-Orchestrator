import { Magnifier, Xmark } from "reicon-react";
import { usePreviewSearchSelect } from "../../../../hooks/usePreviewSearchSelect/usePreviewSearchSelect";
import {
  FOOTER_BUTTON_CLASSES,
  OPTION_BUTTON_CLASSES,
  SEARCH_INPUT_CLASSES,
  TARIFA_BADGE_CLASSES,
  TRIGGER_BASE_CLASSES,
  TRIGGER_IDLE_CLASSES,
  TRIGGER_INVALID_CLASSES,
} from "./PreviewSearchSelect.constants";
import type { PreviewSearchSelectProps } from "./PreviewSearchSelect.types";
import { formatTarifa, optionText } from "./PreviewSearchSelect.utils";

export function PreviewSearchSelect({
  inputId,
  label,
  options,
  value,
  disabled,
  invalid,
  onChange,
}: PreviewSearchSelectProps) {
  const search = usePreviewSearchSelect({ options, value, onChange });

  return (
    <>
      <button
        id={inputId}
        type="button"
        disabled={disabled}
        onClick={search.open}
        className={`${TRIGGER_BASE_CLASSES} ${invalid ? TRIGGER_INVALID_CLASSES : TRIGGER_IDLE_CLASSES}`}
      >
        <span className={`truncate ${search.selected ? "text-fg" : "text-fg-muted"}`}>
          {search.selected ? optionText(search.selected) : "Buscar…"}
        </span>
        <Magnifier size={14} weight="Filled" />
      </button>

      {search.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Buscar ${label}`}
            className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            <header className="shrink-0 bg-brand px-5 py-4">
              <h2 className="text-base font-semibold text-white">Buscar {label}</h2>
              <p className="text-xs text-white/80">Seleccioná una opción del catálogo</p>
            </header>

            <div className="relative shrink-0 border-b border-border p-4">
              <span className="pointer-events-none absolute top-1/2 left-7 -translate-y-1/2 text-fg-muted">
                <Magnifier size={14} weight="Filled" />
              </span>
              <input
                ref={search.searchRef}
                value={search.query}
                onChange={(event) => search.setQuery(event.target.value)}
                placeholder="Buscar por código o descripción…"
                aria-label={`Buscar ${label}`}
                className={SEARCH_INPUT_CLASSES}
              />
            </div>

            {search.results.length === 0 ? (
              <p className="flex-1 px-5 py-6 text-sm text-fg-subtle">
                No encontré ninguna opción para “{search.query}”.
              </p>
            ) : (
              <ul className="min-h-0 flex-1 list-none divide-y divide-border overflow-auto">
                {search.results.map((option) => (
                  <li
                    key={option.id}
                    className={option.id === search.selected?.id ? "bg-brand-surface" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => search.choose(option)}
                      className={OPTION_BUTTON_CLASSES}
                    >
                      <span className="min-w-0">
                        {option.code && (
                          <span className="block text-xs font-semibold text-success">
                            {option.code}
                          </span>
                        )}
                        <span className="block text-sm text-fg">{option.label}</span>
                      </span>
                      {option.tarifa !== undefined && (
                        <span className={TARIFA_BADGE_CLASSES}>{formatTarifa(option.tarifa)}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-3">
              <span className="text-[11px] text-fg-subtle">
                {search.results.length} de {options.length}
              </span>
              <div className="flex items-center gap-2">
                {search.selected && (
                  <button
                    type="button"
                    onClick={() => search.choose(null)}
                    className={`${FOOTER_BUTTON_CLASSES} flex items-center gap-1`}
                  >
                    <Xmark size={12} weight="Filled" />
                    Quitar
                  </button>
                )}
                <button type="button" onClick={search.close} className={FOOTER_BUTTON_CLASSES}>
                  Cancelar
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
