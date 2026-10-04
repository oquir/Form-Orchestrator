import { useEffect, useRef } from "react";
import { Check, Plus, Signpost } from "reicon-react";
import { useFieldRules } from "../../../hooks/useFieldRules/useFieldRules";
import { useKnownFieldNames } from "../../../hooks/useKnownFieldNames/useKnownFieldNames";
import { useModalKeyGuard } from "../../../hooks/useModalKeyGuard/useModalKeyGuard";
import { Button } from "../../atoms/Button/Button";
import { DashedAddButton } from "../../atoms/DashedAddButton/DashedAddButton";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import { FieldRuleCard } from "../../molecules/FieldRuleCard/FieldRuleCard";
import {
  ADD_RULE_CLASSES,
  HINT_CLASSES,
  NO_CANDIDATES_HINT,
  NO_RULES_HINT,
  RULES_HINT,
} from "./FieldRulesModal.constants";
import type { FieldRulesModalProps } from "./FieldRulesModal.types";

export function FieldRulesModal({ field, candidates, onClose }: FieldRulesModalProps) {
  const rules = useFieldRules({ field, candidates });
  const knownNames: Set<string> = useKnownFieldNames();
  const { dialogRef, handleDialogKeyDown } = useModalKeyGuard(onClose);
  const firstNameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  return (
    <ModalShell
      maxWidthClassName="max-w-3xl"
      eyebrow={
        <>
          <Signpost size={12} />
          Reglas condicionales
        </>
      }
      title={field.label || field.name}
      description={RULES_HINT}
      onClose={onClose}
      dialogRef={dialogRef}
      onKeyDown={handleDialogKeyDown}
      footer={
        <ModalActions>
          <Button
            variant="primary"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            <Check size={14} weight="Filled" />
            Listo
          </Button>
        </ModalActions>
      }
    >
      {rules.rules.length === 0 ? (
        <p className={HINT_CLASSES}>{NO_RULES_HINT}</p>
      ) : (
        <ol className="flex list-none flex-col gap-4">
          {rules.rules.map((rule, index) => (
            <FieldRuleCard
              key={rule.id}
              rule={rule}
              index={index}
              rulesCount={rules.rules.length}
              rules={rules}
              candidates={candidates}
              knownNames={knownNames}
              nameInputRef={index === 0 ? firstNameRef : undefined}
            />
          ))}
        </ol>
      )}

      <DashedAddButton
        onClick={rules.addRule}
        disabled={!rules.canAddRule}
        title={rules.canAddRule ? undefined : NO_CANDIDATES_HINT}
        className={ADD_RULE_CLASSES}
      >
        <Plus size={14} className="text-brand-fg" />
        Agregar regla
      </DashedAddButton>
    </ModalShell>
  );
}
