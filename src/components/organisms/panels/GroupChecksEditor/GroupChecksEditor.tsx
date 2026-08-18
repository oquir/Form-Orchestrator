import { Plus, Trash } from "reicon-react";
import { useGroupChecksEditor } from "../../../../hooks/useGroupChecksEditor/useGroupChecksEditor";
import { validateFieldScript } from "../../../../lib/fieldScript/fieldScript";
import { IconButton } from "../../../atoms/IconButton/IconButton";
import { ToggleSwitch } from "../../../atoms/ToggleSwitch/ToggleSwitch";
import { ScriptInput } from "../../../molecules/ScriptInput/ScriptInput";
import {
  CHECK_CARD_CLASSES,
  CHECK_HINT,
  CHECK_PLACEHOLDER,
  ERROR_CLASSES,
  HINT_CLASSES,
  INPUT_CLASSES,
  MESSAGE_HINT,
} from "./GroupChecksEditor.constants";
import type { GroupChecksEditorProps } from "./GroupChecksEditor.types";

export function GroupChecksEditor({ group }: GroupChecksEditorProps) {
  const {
    isOpen,
    toggleOpen,
    checks,
    activeCount,
    candidates,
    knownNames,
    formScript,
    addCheck,
    removeCheck,
    patchCheck,
  } = useGroupChecksEditor({ group });

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleOpen}
          className="text-[11px] font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover"
        >
          {isOpen ? "▾" : "▸"} Comprobaciones del grupo
          {checks.length > 0 && ` (${activeCount} de ${checks.length} activas)`}
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={addCheck}
            className="flex items-center gap-1 text-[11px] font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover"
          >
            <Plus size={11} weight="Filled" />
            <span>Comprobación</span>
          </button>
        )}
      </div>

      {isOpen && checks.length === 0 && (
        <p className={HINT_CLASSES}>
          Una comprobación compara el grupo entero con el resto del formulario — por ejemplo, que la
          suma de una columna coincida con un renglón de otro paso.
        </p>
      )}

      {isOpen &&
        checks.map((check) => {
          const validation = validateFieldScript(check.script, knownNames, formScript);

          return (
            <div key={check.id} className={CHECK_CARD_CLASSES}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={check.label}
                  onChange={(event) => patchCheck(check.id, { label: event.target.value })}
                  placeholder="Nombre de la comprobación"
                  className={`${INPUT_CLASSES} flex-1`}
                />
                <ToggleSwitch
                  checked={check.enabled}
                  onChange={(enabled) => patchCheck(check.id, { enabled })}
                  label="Activar esta comprobación"
                />
                <IconButton
                  onClick={() => removeCheck(check.id)}
                  title="Quitar la comprobación"
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-fg-subtle hover:cursor-pointer hover:border-danger-border hover:text-danger"
                >
                  <Trash size={11} weight="Filled" />
                </IconButton>
              </div>

              <ScriptInput
                id={`group-check-${check.id}`}
                label="Condición"
                value={check.script}
                rows={4}
                knownNames={knownNames}
                placeholder={CHECK_PLACEHOLDER}
                insertCandidates={candidates}
                onChange={(next) => patchCheck(check.id, { script: next })}
              />

              {validation.error && <p className={ERROR_CLASSES}>{validation.error}</p>}

              {validation.unknown.length > 0 && (
                <p className={ERROR_CLASSES}>
                  {validation.unknown.map((name) => `{${name}}`).join(", ")} no coincide con ningún
                  campo.
                </p>
              )}

              <input
                type="text"
                value={check.message}
                onChange={(event) => patchCheck(check.id, { message: event.target.value })}
                placeholder="Mensaje de error"
                className={INPUT_CLASSES}
              />

              <p className={HINT_CLASSES}>{MESSAGE_HINT}</p>
              <p className={HINT_CLASSES}>{CHECK_HINT}</p>
            </div>
          );
        })}
    </div>
  );
}
