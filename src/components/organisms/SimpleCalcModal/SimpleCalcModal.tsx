import { AngleDown2, Calculator, Check, Code12, InfoCircle, Plus } from "reicon-react";
import { useSimpleCalcBuilder } from "../../../hooks/useSimpleCalcBuilder/useSimpleCalcBuilder";
import { Button } from "../../atoms/Button/Button";
import { CodeBlock } from "../../atoms/CodeBlock/CodeBlock";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { ToggleSwitch } from "../../atoms/ToggleSwitch/ToggleSwitch";
import { CalcTermRow } from "../../molecules/CalcTermRow/CalcTermRow";
import {
  ADD_TERM_CLASSES,
  CODE_CHEVRON_CLASSES,
  CODE_DETAILS_CLASSES,
  CODE_SUMMARY_CLASSES,
  CUSTOM_SCRIPT_WARNING,
  ERROR_CLASSES,
  FLOOR_HINT,
  FLOOR_TIP,
  FLOOR_TIP_CLASSES,
  HINT_CLASSES,
  INCOMPLETE_PREVIEW,
  INLINE_CODE_CLASSES,
  MULTIPLIER_ADDON_CLASSES,
  MULTIPLIER_INPUT_CLASSES,
  OPTION_CARD_CLASSES,
  OPTION_HINT_CLASSES,
  OPTION_TITLE_CLASSES,
  SECTION_COUNT_CLASSES,
  SECTION_TITLE_CLASSES,
  WARNING_BANNER_CLASSES,
} from "./SimpleCalcModal.constants";
import type { SimpleCalcModalProps } from "./SimpleCalcModal.types";
import { chosenFieldsLabel } from "./SimpleCalcModal.utils";

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
    <ModalShell
      maxWidthClassName="max-w-3xl"
      eyebrow={
        <>
          <Calculator size={12} />
          Asistente de cálculo sin código
        </>
      }
      title={field.label || field.name}
      onClose={onClose}
      footer={
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
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            <Check size={14} weight="Filled" />
            Aplicar cálculo
          </Button>
        </ModalActions>
      }
    >
      {replacesCustomScript && <p className={WARNING_BANNER_CLASSES}>{CUSTOM_SCRIPT_WARNING}</p>}

      <section aria-labelledby="simple-calc-terms" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id="simple-calc-terms" className={SECTION_TITLE_CLASSES}>
            Campos a combinar
          </h3>
          <span className={SECTION_COUNT_CLASSES}>{chosenFieldsLabel(terms)}</span>
        </div>

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

        <DashedAddButton onClick={addTerm} className={ADD_TERM_CLASSES}>
          <Plus size={14} className="text-brand-fg" />
          Agregar campo al cálculo
        </DashedAddButton>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={OPTION_CARD_CLASSES}>
          <div className="flex flex-col gap-1">
            <label htmlFor="simple-calc-multiplier" className={OPTION_TITLE_CLASSES}>
              Multiplicar el resultado por
            </label>
            <p className={OPTION_HINT_CLASSES}>
              Vacío no multiplica. Para un 15 % escribí{" "}
              <code className={INLINE_CODE_CLASSES}>0.15</code>.
            </p>
          </div>
          <div className="mt-auto flex">
            <input
              id="simple-calc-multiplier"
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={multiplierText}
              onChange={(event) => setMultiplierText(event.target.value)}
              className={MULTIPLIER_INPUT_CLASSES}
            />
            <span className={MULTIPLIER_ADDON_CLASSES}>Factor</span>
          </div>
        </div>

        <div className={OPTION_CARD_CLASSES}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className={OPTION_TITLE_CLASSES}>No bajar de 0</span>
              <p className={OPTION_HINT_CLASSES}>{FLOOR_HINT}</p>
            </div>
            <ToggleSwitch
              checked={floorAtZero}
              onChange={setFloorAtZero}
              label="Si el resultado da negativo, dejar el campo en 0"
            />
          </div>
          <p className={FLOOR_TIP_CLASSES}>
            <InfoCircle size={12} />
            {FLOOR_TIP}
          </p>
        </div>
      </div>

      {problems.map((problem) => (
        <p key={problem} className={ERROR_CLASSES}>
          {problem}
        </p>
      ))}

      <details className={CODE_DETAILS_CLASSES}>
        <summary className={CODE_SUMMARY_CLASSES}>
          <span className="flex items-center gap-2">
            <Code12 size={14} className="text-brand-fg" />
            Ver el script generado
          </span>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-normal text-fg-subtle">JavaScript</span>
            <AngleDown2 size={14} className={CODE_CHEVRON_CLASSES} />
          </span>
        </summary>
        <div className="border-t border-border p-3">
          {preview === null ? (
            <p className={HINT_CLASSES}>{INCOMPLETE_PREVIEW}</p>
          ) : (
            <CodeBlock>{preview}</CodeBlock>
          )}
        </div>
      </details>
    </ModalShell>
  );
}
