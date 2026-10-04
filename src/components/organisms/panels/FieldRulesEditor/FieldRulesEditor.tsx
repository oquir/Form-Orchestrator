import { useState } from "react";
import { useFieldRules } from "../../../../hooks/useFieldRules/useFieldRules";
import { Button } from "../../../atoms/Button/Button";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { FieldRulesModal } from "../../FieldRulesModal/FieldRulesModal";
import {
  COUNT_CLASSES,
  HINT_CLASSES,
  NO_CANDIDATES_HINT,
  NO_RULES_HINT,
  NUMBER_BADGE_CLASSES,
  RULES_HINT,
  SUMMARY_CLASSES,
  SUMMARY_CODE_CLASSES,
  SUMMARY_EFFECT_CLASSES,
  SUMMARY_LABEL_CLASSES,
  SUMMARY_WHEN_CLASSES,
  WARNING_CLASSES,
} from "./FieldRulesEditor.constants";
import type { FieldRulesEditorProps, RuleSummary } from "./FieldRulesEditor.types";
import { summarizeRule } from "./FieldRulesEditor.utils";

export function FieldRulesEditor({ field, candidates }: FieldRulesEditorProps) {
  const { rules, canAddRule, addRule } = useFieldRules({ field, candidates });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const summaries: RuleSummary[] = rules.map((rule) => summarizeRule(rule, candidates));
  const hasRules: boolean = rules.length > 0;

  function openModal(): void {
    if (!hasRules) addRule();
    setIsModalOpen(true);
  }

  return (
    <PanelSection
      title="Reglas condicionales"
      description={RULES_HINT}
      aside={hasRules ? <span className={COUNT_CLASSES}>{rules.length}</span> : null}
    >
      {hasRules ? (
        <ol className="flex list-none flex-col gap-2">
          {summaries.map((summary, index) => (
            <li key={summary.id} className={SUMMARY_CLASSES}>
              <span className={NUMBER_BADGE_CLASSES}>{index + 1}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
                {summary.label && <span className={SUMMARY_LABEL_CLASSES}>{summary.label}</span>}
                <span className={SUMMARY_WHEN_CLASSES}>{summary.when}</span>
                {summary.effects.length === 0 ? (
                  <span className={WARNING_CLASSES}>Todavía no hace nada</span>
                ) : (
                  summary.effects.map((effect) => (
                    <span
                      key={effect.id}
                      title={effect.text}
                      className={effect.isCode ? SUMMARY_CODE_CLASSES : SUMMARY_EFFECT_CLASSES}
                    >
                      → {effect.text}
                    </span>
                  ))
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={HINT_CLASSES}>{canAddRule ? NO_RULES_HINT : NO_CANDIDATES_HINT}</p>
      )}

      <Button
        variant="secondary"
        onClick={openModal}
        disabled={!hasRules && !canAddRule}
        className="px-3 py-1.5 text-xs hover:cursor-pointer"
      >
        {hasRules ? "Editar reglas" : "Agregar regla"}
      </Button>

      {isModalOpen && (
        <FieldRulesModal
          field={field}
          candidates={candidates}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </PanelSection>
  );
}
