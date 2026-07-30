export interface FormulaToken {
  kind: "number" | "ident" | "op";
  text: string;
  pos: number;
}

export interface FormulaNumberNode {
  kind: "number";
  value: number;
}

export interface FormulaRefNode {
  kind: "ref";
  name: string;
}

export interface FormulaUnaryNode {
  kind: "unary";
  operator: string;
  operand: FormulaNode;
}

export interface FormulaBinaryNode {
  kind: "binary";
  operator: string;
  left: FormulaNode;
  right: FormulaNode;
}

export interface FormulaCallNode {
  kind: "call";
  callee: string;
  args: FormulaNode[];
}

export type FormulaNode =
  | FormulaNumberNode
  | FormulaRefNode
  | FormulaUnaryNode
  | FormulaBinaryNode
  | FormulaCallNode;

export interface FormulaParseResult {
  ast: FormulaNode | null;
  error: string | null;
}

export interface FormulaValidation {
  ast: FormulaNode | null;
  error: string | null;
  refs: string[];
  unknownRefs: string[];
  isEmpty: boolean;
  isValid: boolean;
}

export interface FormulaFunction {
  minArgs: number;
  maxArgs: number;
  apply: (args: number[]) => number;
}
