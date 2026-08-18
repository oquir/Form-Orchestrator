import { useFieldRules } from "../../../../hooks/useFieldRules/useFieldRules";
import { FieldRuleCard } from "../../../molecules/FieldRuleCard/FieldRuleCard";
import { PanelSection } from "../../../molecules/PanelSection/PanelSection";
import { ADD_LINK_CLASSES, COUNT_CLASSES, RULES_HINT } from "./FieldRulesEditor.constants";
import type { FieldRulesEditorProps } from "./FieldRulesEditor.types";

export function FieldRulesEditor({ field, candidates }: FieldRulesEditorProps) {
  const rules = useFieldRules({ field, candidates });
  const knownNames: Set<string> = new Set([field, ...candidates].map((entry) => entry.name));

  return (
    <PanelSection
      title="Reglas condicionales"
      aside={
        rules.rules.length > 0 ? <span className={COUNT_CLASSES}>{rules.rules.length}</span> : null
      }
    >
      {rules.rules.length === 0 ? (
        <p className="text-[11px] text-fg-subtle">
          {rules.canAddRule
            ? "Sin reglas. El campo toma el valor que devuelva su script."
            : "Agregá otros campos al lienzo para poder condicionar el cálculo de este."}
        </p>
      ) : (
        <>
          <p className="text-[11px] text-fg-subtle">{RULES_HINT}</p>
          <ul className="flex list-none flex-col gap-3">
            {rules.rules.map((rule, index) => (
              <FieldRuleCard
                key={rule.id}
                rule={rule}
                index={index}
                rulesCount={rules.rules.length}
                rules={rules}
                candidates={candidates}
                knownNames={knownNames}
              />
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        onClick={rules.addRule}
        disabled={!rules.canAddRule}
        className={`${ADD_LINK_CLASSES} self-start`}
      >
        + Agregar regla
      </button>
    </PanelSection>
  );
}
