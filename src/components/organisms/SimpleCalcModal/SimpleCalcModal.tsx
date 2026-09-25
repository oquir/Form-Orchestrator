import { useSimpleCalcBuilder } from "../../../hooks/useSimpleCalcBuilder/useSimpleCalcBuilder";
import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { ToggleSwitch } from "../../atoms/ToggleSwitch/ToggleSwitch";
import { CalcTermRow } from "../../molecules/CalcTermRow/CalcTermRow";
import {
  ADD_LINK_CLASSES,
  BODY_CLASSES,
  CODE_CLASSES,
  CODE_SUMMARY_CLASSES,
  CUSTOM_SCRIPT_WARNING,
  ERROR_CLASSES,
  FLOOR_HINT,
  HINT_CLASSES,
  INCOMPLETE_PREVIEW,
  INPUT_CLASSES,
  MULTIPLIER_HINT,
  OPTION_LABEL_CLASSES,
  SUBTITLE_CLASSES,
  TITLE_CLASSES,
  WARNING_BANNER_CLASSES,
} from "./SimpleCalcModal.constants";
import type { SimpleCalcModalProps } from "./SimpleCalcModal.types";

export function SimpleCalcModal({ field, candidates, onClose }: SimpleCalcModalProps) {
  const {
    optionGroups,
    terms,
    floorAtZero,
    multiplierText,
    replacesCustomScript,
    problems,
    preview,
    firstSelectRef,
    addTerm,
    removeTerm,
    setTermSign,
    setTermField,
    setFloorAtZero,
    setMultiplierText,
    apply,
  } = useSimpleCalcBuilder({ field, candidates, onClose });

  return (
    <ModalShell maxWidthClassName="max-w-2xl">
      <h2 className={TITLE_CLASSES}>Cálculo sin código</h2>
      <p className={SUBTITLE_CLASSES}>
        <span className="font-medium text-fg">{field.label || field.name}</span> = los campos que
        elijas, sumados o restados. Al aplicar se escribe el script del campo.
      </p>

      <div className={BODY_CLASSES}>
        {replacesCustomScript && <p className={WARNING_BANNER_CLASSES}>{CUSTOM_SCRIPT_WARNING}</p>}

        <div className="flex flex-col gap-2">
          <ul className="flex list-none flex-col gap-2">
            {terms.map((term, index) => (
              <CalcTermRow
                key={term.id}
                term={term}
                position={index + 1}
                optionGroups={optionGroups}
                canRemove={terms.length > 1}
                selectRef={index === 0 ? firstSelectRef : undefined}
                onSignChange={(sign) => setTermSign(term.id, sign)}
                onFieldChange={(fieldId) => setTermField(term.id, fieldId)}
                onRemove={() => removeTerm(term.id)}
              />
            ))}
          </ul>
          <button type="button" onClick={addTerm} className={`${ADD_LINK_CLASSES} self-start`}>
            + Agregar campo
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="simple-calc-multiplier" className={OPTION_LABEL_CLASSES}>
              Multiplicar el resultado por
            </label>
            <input
              id="simple-calc-multiplier"
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={multiplierText}
              onChange={(event) => setMultiplierText(event.target.value)}
              className={`${INPUT_CLASSES} max-w-28 text-right`}
            />
          </div>
          <span className={HINT_CLASSES}>{MULTIPLIER_HINT}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className={OPTION_LABEL_CLASSES}>No bajar de 0</span>
            <ToggleSwitch
              checked={floorAtZero}
              onChange={setFloorAtZero}
              label="Si el resultado da negativo, dejar el campo en 0"
            />
          </div>
          <span className={HINT_CLASSES}>{FLOOR_HINT}</span>
        </div>

        {problems.map((problem) => (
          <p key={problem} className={ERROR_CLASSES}>
            {problem}
          </p>
        ))}

        <details>
          <summary className={CODE_SUMMARY_CLASSES}>Ver código</summary>
          <pre className={CODE_CLASSES}>{preview ?? INCOMPLETE_PREVIEW}</pre>
        </details>
      </div>

      <ModalActions>
        <Button
          variant="ghost"
          onClick={onClose}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={preview === null}
          onClick={apply}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Aplicar
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
