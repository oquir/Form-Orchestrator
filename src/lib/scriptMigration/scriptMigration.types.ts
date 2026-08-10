// El AST del lenguaje de formulas, que ya nadie escribe. Vive aca y no en src/types porque no es
// parte del modelo: es la forma intermedia por la que pasa un borrador viejo camino al script.

export interface FormulaToken {
  kind: "number" | "ident" | "op";
  text: string;
  pos: number;
}

export type FormulaNode =
  | { kind: "number"; value: number }
  | { kind: "ref"; name: string }
  | { kind: "unary"; operator: string; operand: FormulaNode }
  | { kind: "binary"; operator: string; left: FormulaNode; right: FormulaNode }
  | { kind: "call"; callee: string; args: FormulaNode[] }
  | { kind: "aggregate"; fn: string; ref: string };

export interface Cursor {
  tokens: FormulaToken[];
  index: number;
}

export interface FormulaArity {
  minArgs: number;
  maxArgs: number;
}
