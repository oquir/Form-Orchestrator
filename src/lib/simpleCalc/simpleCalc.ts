import type { CanvasField } from "../../types/field";
import type { FieldGraph } from "../../types/fieldGraph";
import type { FormStep } from "../../types/formStructure";
import type {
  CalcTermIndex,
  CalcTermOption,
  CalcTermOptionGroup,
  SimpleCalc,
  SimpleCalcTerm,
} from "../../types/simpleCalc";
import { wouldCreateCycle } from "../fieldGraph/fieldGraph";
import { isNumericField } from "../fieldKind/fieldKind";
import { fieldRefText } from "../fieldScript/fieldScript";
import { findGroupById, findGroupIdForField } from "../repeatableGroup/repeatableGroup";
import {
  ALL_ROWS_CAPTION,
  ALL_WHITESPACE_PATTERN,
  RETURN_ON_SAME_LINE,
  SAME_ROW_CAPTION,
  TRAILING_SEMICOLON_PATTERN,
} from "./simpleCalc.constants";
import type { CalcShape } from "./simpleCalc.types";
import { readCalcShape } from "./simpleCalc.utils";

// Calculo sin codigo: la traduccion entre una lista de campos con signo (mas un multiplicador y un
// piso en cero) y el texto de logic.script, en los dos sentidos. Nada de React ni del store.
//
// No hay un modelo guardado aparte del script: el modal lo lee al abrir y escribe uno nuevo al
// aplicar. Asi logic.script sigue siendo el unico lugar donde se calcula un campo, y ni el borrador
// ni el export se enteran de que este editor existe.

// Desde otro grupo, o desde fuera de todos, la columna de un grupo llega al script como arreglo
// (formRuntime) y un + la pegaria como texto: por eso importa en que grupo esta el campo editado.
function findEditedGroupId(formSteps: FormStep[], fieldId: string): string | undefined {
  for (const step of formSteps) {
    const groupId: string | undefined = findGroupIdForField(step.rows, fieldId);
    if (groupId !== undefined) return groupId;
  }

  return undefined;
}

// Solo campos numericos de los pasos del formulario, sin el propio campo. Uno que ya depende del
// campo editado sigue en la lista pero marcado: elegirlo cerraria un ciclo, que es lo mismo que
// la revision de exportacion bloquea.
export function buildCalcTermOptions(
  formSteps: FormStep[],
  field: CanvasField,
  graph: FieldGraph,
): CalcTermOptionGroup[] {
  const editedGroupId: string | undefined = findEditedGroupId(formSteps, field.id);
  const groups: CalcTermOptionGroup[] = [];

  for (const step of formSteps) {
    const loose: CalcTermOption[] = [];
    const byGroup: Map<string, CalcTermOption[]> = new Map();

    for (const row of step.rows) {
      for (const candidate of row.fields) {
        if (candidate.id === field.id || !isNumericField(candidate.type)) continue;

        const option: CalcTermOption = {
          fieldId: candidate.id,
          name: candidate.name,
          label: candidate.label.trim() || candidate.name,
          aggregated: row.groupId !== undefined && row.groupId !== editedGroupId,
          createsCycle: wouldCreateCycle(graph, field.id, candidate.id),
        };

        if (row.groupId === undefined) loose.push(option);
        else byGroup.set(row.groupId, [...(byGroup.get(row.groupId) ?? []), option]);
      }
    }

    if (loose.length > 0) groups.push({ id: step.stepId, label: step.title, options: loose });

    for (const [groupId, options] of byGroup) {
      const title: string = findGroupById(step, groupId)?.title ?? step.title;
      const caption: string = groupId === editedGroupId ? SAME_ROW_CAPTION : ALL_ROWS_CAPTION;

      groups.push({
        id: `${step.stepId}:${groupId}`,
        label: `${step.title} · ${title} (${caption})`,
        options,
      });
    }
  }

  return groups;
}

export function indexCalcTermOptions(groups: CalcTermOptionGroup[]): CalcTermIndex {
  const byId: Map<string, CalcTermOption> = new Map();
  const byName: Map<string, CalcTermOption> = new Map();

  for (const group of groups) {
    for (const option of group.options) {
      byId.set(option.fieldId, option);
      byName.set(option.name, option);
    }
  }

  return { byId, byName };
}

function termRefText(option: CalcTermOption): string {
  const ref: string = fieldRefText(option.name);

  return option.aggregated ? `sum(${ref})` : ref;
}

// El texto copia letra por letra el estilo de la plantilla ICA (una linea, " + " y " - ", punto y
// coma al final): es lo que deja reabrir en el modal los renglones que ya trae. Devuelve null si
// falta algo para escribirlo, y entonces no hay nada que aplicar.
export function buildSimpleCalcScript(calc: SimpleCalc, index: CalcTermIndex): string | null {
  if (calc.terms.length === 0) return null;
  if (calc.multiplier !== null && !Number.isFinite(calc.multiplier)) return null;

  const parts: string[] = [];

  for (const term of calc.terms) {
    const option: CalcTermOption | undefined = index.byId.get(term.fieldId);
    if (!option) return null;

    const ref: string = termRefText(option);

    if (parts.length === 0) parts.push(term.sign === "-" ? `-${ref}` : ref);
    else parts.push(` ${term.sign} ${ref}`);
  }

  let expression: string = parts.join("");

  if (calc.multiplier !== null) {
    const operand: string = calc.terms.length > 1 ? `(${expression})` : expression;
    expression = `${operand} * ${String(calc.multiplier)}`;
  }

  // El piso va por fuera del multiplicador: lo que no puede bajar de cero es el valor del campo.
  if (calc.floorAtZero) expression = `max(${expression}, 0)`;

  return `return ${expression};`;
}

// El punto y coma final es opcional en JS y el lector lo acepta, asi que se quita de los dos lados.
function compactScript(text: string): string {
  return text.replace(ALL_WHITESPACE_PATTERN, "").replace(TRAILING_SEMICOLON_PATTERN, "");
}

// Devuelve el calculo solo si el script es exactamente lo que buildSimpleCalcScript escribiria con
// el: se lee con manga ancha y despues se regenera y se compara sin espacios. Asi el modal nunca
// toma como suyo un script que no sabria volver a escribir igual (un sum() de mas, parentesis
// sueltos, un campo que no es numerico o que ya no existe).
export function parseSimpleCalcScript(script: string, index: CalcTermIndex): SimpleCalc | null {
  const trimmed: string = script.trim();
  if (!RETURN_ON_SAME_LINE.test(trimmed)) return null;

  const shape: CalcShape | null = readCalcShape(trimmed);
  if (shape === null) return null;

  const terms: SimpleCalcTerm[] = [];

  for (const term of shape.terms) {
    const option: CalcTermOption | undefined = index.byName.get(term.name);
    if (!option) return null;

    terms.push({ sign: term.sign, fieldId: option.fieldId });
  }

  const calc: SimpleCalc = { terms, floorAtZero: shape.floorAtZero, multiplier: shape.multiplier };
  const regenerated: string | null = buildSimpleCalcScript(calc, index);

  return regenerated !== null && compactScript(regenerated) === compactScript(trimmed)
    ? calc
    : null;
}
