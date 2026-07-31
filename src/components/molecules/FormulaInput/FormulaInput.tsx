import { useMemo } from "react";
import { validateFormula } from "../../../lib/formula/formula";
import type { FormulaValidation } from "../../../lib/formula/formula.types";
import { Label } from "../../atoms/Label/Label";
import {
  AGGREGATE_NAMES,
  FORMULA_HELP,
  FORMULA_SELECT_CLASSES,
  FORMULA_TEXTAREA_CLASSES,
  FUNCTION_NAMES,
} from "./FormulaInput.constants";
import type { FormulaInputProps } from "./FormulaInput.types";

export function FormulaInput({
  id,
  label,
  value,
  candidates,
  selfName,
  placeholder,
  onChange,
}: FormulaInputProps) {
  const knownNames: Set<string> = useMemo(
    () => new Set(candidates.map((candidate) => candidate.name)),
    [candidates],
  );
  const validation: FormulaValidation = useMemo(
    () => validateFormula(value, knownNames),
    [value, knownNames],
  );
  const referencesSelf = selfName !== undefined && validation.refs.includes(selfName);

  function insertName(name: string): void {
    if (name.length === 0) return;
    const separator = value.trim().length === 0 ? "" : " ";
    onChange(`${value}${separator}${name}`);
  }

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>

      <textarea
        id={id}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={FORMULA_TEXTAREA_CLASSES}
      />

      <div className="flex items-center gap-2">
        <select
          value=""
          onChange={(event) => insertName(event.target.value)}
          disabled={candidates.length === 0}
          className={FORMULA_SELECT_CLASSES}
          aria-label="Insertar campo en la fórmula"
        >
          <option value="">+ Insertar campo…</option>
          {candidates.map((candidate) => (
            <option key={candidate.id} value={candidate.name}>
              {candidate.label} · {candidate.name}
            </option>
          ))}
        </select>
      </div>

      {validation.error && <p className="text-[11px] text-danger">{validation.error}</p>}

      {validation.unknownRefs.length > 0 && (
        <p className="text-[11px] text-danger">
          No existe ningún campo llamado {validation.unknownRefs.join(", ")}.
        </p>
      )}

      {referencesSelf && (
        <p className="text-[11px] text-warning">
          La fórmula se referencia a sí misma ({selfName}); el cálculo no va a poder resolverse.
        </p>
      )}

      <p className="text-[11px] text-fg-subtle">
        {FORMULA_HELP} Funciones: {FUNCTION_NAMES}. Sobre un grupo repetible: {AGGREGATE_NAMES}.
      </p>
    </div>
  );
}
