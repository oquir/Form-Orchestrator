import { AGGREGATE_TO_HELPER, PRECEDENCE, UNARY_PRECEDENCE } from "./scriptMigration.constants";
import type { FormulaNode } from "./scriptMigration.types";

// Impresor del AST de formula como expresion JS. El resultado lo va a leer y editar una persona,
// asi que no alcanza con que sea correcto: tiene que salir con la forma en que estaba escrito.
// Por eso los parentesis van por precedencia y no envolviendo todo por las dudas.

// Un hijo lleva parentesis si liga mas flojo que su padre, y tambien si liga igual y esta a la
// derecha: el parser es asociativo a izquierda, asi que un binario de igual precedencia ahi solo
// aparece si la fuente traia parentesis, y a - (b - c) no es lo mismo que a - b - c.
function wrap(text: string, precedence: number, parent: number, isRight: boolean): string {
  const needed: boolean = precedence < parent || (precedence === parent && isRight);

  return needed ? `(${text})` : text;
}

export function printNode(node: FormulaNode, parent: number, isRight: boolean): string {
  switch (node.kind) {
    case "number":
      return String(node.value);

    case "ref":
      return `{${node.name}}`;

    case "aggregate":
      return `${AGGREGATE_TO_HELPER[node.fn] ?? node.fn}({${node.ref}})`;

    // Los argumentos arrancan de cero: adentro de los parentesis de una llamada nada necesita
    // envolverse otra vez.
    case "call":
      return `${node.callee}(${node.args.map((arg) => printNode(arg, 0, false)).join(", ")})`;

    case "unary":
      return wrap(
        `${node.operator}${printNode(node.operand, UNARY_PRECEDENCE, false)}`,
        UNARY_PRECEDENCE,
        parent,
        isRight,
      );

    case "binary": {
      const precedence: number = PRECEDENCE[node.operator] ?? 0;
      const left: string = printNode(node.left, precedence, false);
      const right: string = printNode(node.right, precedence, true);

      return wrap(`${left} ${node.operator} ${right}`, precedence, parent, isRight);
    }

    default:
      return "";
  }
}
