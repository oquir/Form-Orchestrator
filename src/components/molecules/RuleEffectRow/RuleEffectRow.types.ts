import type { CanvasField, RuleEffect } from "../../../types/field";

export interface RuleEffectRowProps {
  effect: RuleEffect;
  candidates: CanvasField[];
  knownNames: Set<string>;
  onChange: (effect: RuleEffect) => void;
  onRemove: () => void;
}
