import type { RuleEffect } from "../../../types/field";

export interface RuleEffectRowProps {
  effect: RuleEffect;
  knownNames: Set<string>;
  onChange: (effect: RuleEffect) => void;
  onRemove: () => void;
}
