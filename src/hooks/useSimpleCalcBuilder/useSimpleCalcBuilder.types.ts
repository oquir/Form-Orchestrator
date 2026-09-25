import type { RefObject } from "react";
import type { CanvasField } from "../../types/field";
import type {
  CalcSign,
  CalcTermDraft,
  CalcTermOptionGroup,
  SimpleCalc,
} from "../../types/simpleCalc";

export interface UseSimpleCalcBuilderParams {
  field: CanvasField;
  candidates: CanvasField[];
  onClose: () => void;
}

export interface InitialSimpleCalc {
  parsed: SimpleCalc | null;
  replacesCustomScript: boolean;
}

export interface UseSimpleCalcBuilderResult {
  optionGroups: CalcTermOptionGroup[];
  terms: CalcTermDraft[];
  floorAtZero: boolean;
  multiplierText: string;
  replacesCustomScript: boolean;
  problems: string[];
  preview: string | null;
  firstSelectRef: RefObject<HTMLSelectElement | null>;
  addTerm: () => void;
  removeTerm: (id: string) => void;
  setTermSign: (id: string, sign: CalcSign) => void;
  setTermField: (id: string, fieldId: string) => void;
  setFloorAtZero: (checked: boolean) => void;
  setMultiplierText: (text: string) => void;
  apply: () => void;
}
