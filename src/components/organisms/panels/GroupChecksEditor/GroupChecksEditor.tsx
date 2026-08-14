import { useMemo, useState } from "react";
import { Trash } from "reicon-react";
import { validateFieldScript } from "../../../../lib/fieldScript/fieldScript";
import { createGroupCheck } from "../../../../lib/groupCheck/groupCheck";
import { getAllFields, useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/field";
import type { GroupCheck } from "../../../../types/groupCheck";
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
  const updateGroup = useFormStore((state) => state.updateGroup);
  const formSteps = useFormStore((state) => state.formSteps);
  const formScript = useFormStore((state) => state.formScript);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const checks: GroupCheck[] = group.checks ?? [];
  const candidates: CanvasField[] = useMemo(
    () => getAllFields(formSteps.flatMap((step) => step.rows)),
    [formSteps],
  );
  const knownNames: Set<string> = useMemo(
    () => new Set(candidates.map((field) => field.name)),
    [candidates],
  );

  function write(next: GroupCheck[]): void {
    updateGroup(group.id, { checks: next });
  }

  function patch(id: string, updates: Partial<GroupCheck>): void {
    write(checks.map((check) => (check.id === id ? { ...check, ...updates } : check)));
  }

  const active: number = checks.filter((check) => check.enabled).length;

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover"
        >
          {isOpen ? "▾" : "▸"} Comprobaciones del grupo
          {checks.length > 0 && ` (${active} de ${checks.length} activas)`}
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={() => write([...checks, createGroupCheck()])}
            className="text-[11px] font-medium text-brand-fg hover:cursor-pointer hover:text-brand-hover"
          >
            + Comprobación
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
                  onChange={(event) => patch(check.id, { label: event.target.value })}
                  placeholder="Nombre de la comprobación"
                  className={`${INPUT_CLASSES} flex-1`}
                />
                <ToggleSwitch
                  checked={check.enabled}
                  onChange={(enabled) => patch(check.id, { enabled })}
                  label="Activar esta comprobación"
                />
                <IconButton
                  onClick={() => write(checks.filter((other) => other.id !== check.id))}
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
                onChange={(next) => patch(check.id, { script: next })}
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
                onChange={(event) => patch(check.id, { message: event.target.value })}
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
