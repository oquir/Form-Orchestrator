import { Label } from "../../atoms/Label/Label";
import {
  LABEL_TARGET_HINT_CLASSES,
  LABEL_TARGET_SELECT_CLASSES,
  UNLINKED_VALUE,
} from "./LabelTargetSelect.constants";
import type { LabelTargetSelectProps } from "./LabelTargetSelect.types";

export function LabelTargetSelect({ value, candidates, onChange }: LabelTargetSelectProps) {
  const targetIsGone: boolean = value !== undefined && !candidates.some((c) => c.id === value);

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="label-target">Ligada al campo</Label>
      <select
        id="label-target"
        value={value ?? UNLINKED_VALUE}
        onChange={(event) =>
          onChange(event.target.value === UNLINKED_VALUE ? null : event.target.value)
        }
        className={LABEL_TARGET_SELECT_CLASSES}
      >
        <option value={UNLINKED_VALUE}>Ninguno — etiqueta suelta</option>
        {targetIsGone && <option value={value}>(Campo eliminado — reasignar)</option>}
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.label} ({candidate.type})
          </option>
        ))}
      </select>
      <span className={LABEL_TARGET_HINT_CLASSES}>
        El campo ligado deja de mostrar su propia etiqueta.
      </span>
    </div>
  );
}
