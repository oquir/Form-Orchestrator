import type { Ref } from "react";
import type { CalcSign, CalcTermDraft, CalcTermOptionGroup } from "../../../types/simpleCalc";

export interface CalcTermRowProps {
  term: CalcTermDraft;
  position: number;
  optionGroups: CalcTermOptionGroup[];
  canRemove: boolean;
  selectRef?: Ref<HTMLSelectElement>;
  onSignChange: (sign: CalcSign) => void;
  onFieldChange: (fieldId: string) => void;
  onRemove: () => void;
}

export interface CalcSignChoice {
  sign: CalcSign;
  symbol: string;
  label: string;
}
