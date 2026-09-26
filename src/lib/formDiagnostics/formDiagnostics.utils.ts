import { PAYLOAD_SCHEMA } from "../../constants/payloadSchema";
import type { CanvasField, FieldCondition } from "../../types/field";
import type { FieldGraph } from "../../types/fieldGraph";
import type { ScriptCompileResult } from "../../types/fieldScript";
import type { DiagnoseFormInput, ProblemTarget } from "../../types/formDiagnostics";
import type { CanvasRow } from "../../types/formStructure";
import type { SchemaLeaf } from "../../types/payloadSchema";
import type { CanvasTarget } from "../../types/placement";
import type { SidebarTab } from "../../types/ui";
import { unsupportedDeclarations } from "../cssStyles/cssStyles";
import { isValidConceptId } from "../fieldConcept/fieldConcept";
import { buildFieldGraph, describeCycle, topologicalOrder } from "../fieldGraph/fieldGraph";
import { isPresentationalField } from "../fieldKind/fieldKind";
import { isOptionBasedField } from "../fieldOptions/fieldOptions";
import {
  checkScriptSyntax,
  compileScript,
  composeScriptBody,
  fieldRefText,
  validatePrelude,
} from "../fieldScript/fieldScript";
import { enabledChecks } from "../groupCheck/groupCheck";
import { resolveLeaf } from "../payloadSchema/payloadSchema";
import {
  CONCEPT_IN_GROUP_MESSAGE,
  CYCLE_MESSAGE,
  DUPLICATE_CONCEPT_ID_MESSAGE,
  HOST_MAPPING_MESSAGE,
  INVALID_CONCEPT_ID_MESSAGE,
  INVALID_CONDITION_PATTERN_MESSAGE,
  INVALID_OVERRIDE_PATTERN_MESSAGE,
  INVALID_PATTERN_MESSAGE,
  ORPHAN_MAPPING_MESSAGE,
  PRELUDE_READS_FIELDS_MESSAGE,
  PRELUDE_WHERE,
  SCRIPT_SUBJECT,
  TYPES_WITHOUT_PATTERN,
  UNKNOWN_REFS_HINT,
  UNNAMED_LABEL,
  UNSUPPORTED_CSS_MESSAGE,
  UNSUPPORTED_TOOLTIP_CSS_MESSAGE,
} from "./formDiagnostics.constants";
import type {
  LocatedField,
  LocatedGroup,
  LocatedItems,
  LocatedRow,
  PreludeCheck,
  ProblemDraft,
} from "./formDiagnostics.types";

// Los detectores de la revision antes de exportar, uno por tipo de problema. Cada uno recibe la
// cosa ya ubicada en su lienzo, porque el destino de "Ir" necesita saber en que paso vive.

export function locateItems(input: DiagnoseFormInput): LocatedItems {
  const items: LocatedItems = { fields: [], rows: [], groups: [] };

  for (const step of input.formSteps) {
    const canvas: CanvasTarget = { type: "formStep", stepId: step.stepId };
    addRows(items, step.rows, canvas, step.title);
    for (const group of step.groups ?? []) items.groups.push({ group, canvas });
  }

  for (const step of input.introSteps) {
    addRows(items, step.rows, { type: "introStep", stepId: step.stepId }, step.title);
  }

  return items;
}

function addRows(
  items: LocatedItems,
  rows: CanvasRow[],
  canvas: CanvasTarget,
  stepTitle: string,
): void {
  for (const [index, row] of rows.entries()) {
    items.rows.push({ row, canvas, where: `Fila ${index + 1} · ${stepTitle}` });
    for (const field of row.fields) {
      items.fields.push({ field, canvas, inGroup: row.groupId !== undefined });
    }
  }
}

function fieldWhere(field: CanvasField): string {
  const label: string = field.label.trim();

  return label.length > 0 ? `${label} · ${field.name}` : field.name;
}

function fieldTarget(located: LocatedField, tab: SidebarTab): ProblemTarget {
  return { kind: "field", fieldId: located.field.id, canvas: located.canvas, tab };
}

function nameOrUnnamed(label: string | undefined): string {
  const trimmed: string = label?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : UNNAMED_LABEL;
}

export function regexError(source: string): string | null {
  try {
    // Solo interesa si el constructor lanza; el patron no se usa aca.
    new RegExp(source);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Expresión inválida.";
  }
}

export function checkPrelude(formScript: string): PreludeCheck {
  const validation = validatePrelude(formScript);
  const target: ProblemTarget = { kind: "prelude" };
  const problems: ProblemDraft[] = [];

  if (validation.error) {
    problems.push({
      severity: "error",
      where: PRELUDE_WHERE,
      message: `${SCRIPT_SUBJECT} no compila: ${validation.error}`,
      target,
    });
  }

  if (validation.refs.length > 0) {
    const names: string[] = [...new Set(validation.refs.map((ref) => fieldRefText(ref.name)))];
    problems.push({
      severity: "error",
      where: PRELUDE_WHERE,
      message: `${PRELUDE_READS_FIELDS_MESSAGE} ${names.join(", ")}`,
      target,
    });
  }

  // Con el preludio roto los scripts se validan sin el: si no, su error se repetiria en cada campo
  // del formulario en vez de reportarse una sola vez. Roto incluye leer campos: un {{x}} ahi
  // tampoco compila pegado delante de cada script.
  return { problems, prelude: validation.isValid ? formScript : undefined };
}

// Mismo criterio que validateFieldScript, pero separando de quien es el error: el del script solo
// y el que aparece recien al pegarle el preludio, que suele ser una constante declarada en los
// dos lados. Asi el mensaje dice cual de las dos cosas hay que mirar.
function scriptDrafts(
  source: string,
  knownNames: Set<string>,
  prelude: string | undefined,
  where: string,
  target: ProblemTarget,
  subject: string,
): ProblemDraft[] {
  if (source.trim().length === 0) return [];

  const compiled: ScriptCompileResult = compileScript(source, knownNames);

  // Una referencia que no es campo va primero y sola: ese {{x}} sin sustituir casi siempre es
  // tambien el error de sintaxis, y reportar los dos seria contar dos veces el mismo problema.
  if (compiled.unknown.length > 0) {
    const refs: string = compiled.unknown.map(fieldRefText).join(", ");
    const noun: string = compiled.unknown.length === 1 ? "que no es un campo" : "que no son campos";

    return [
      {
        severity: "error",
        where,
        message: `${subject} lee ${refs}, ${noun}. ${UNKNOWN_REFS_HINT}`,
        target,
      },
    ];
  }

  const drafts: ProblemDraft[] = [];
  const ownError: string | null = checkScriptSyntax(compiled.code);
  const body: string = composeScriptBody(compiled.code, prelude);
  const sharedError: string | null =
    ownError === null && body !== compiled.code ? checkScriptSyntax(body) : null;

  if (ownError) {
    drafts.push({
      severity: "error",
      where,
      message: `${subject} no compila: ${ownError}`,
      target,
    });
  } else if (sharedError) {
    drafts.push({
      severity: "error",
      where,
      message: `${subject} no compila junto con el script del formulario: ${sharedError}`,
      target,
    });
  }

  return drafts;
}

export function scriptProblems(
  located: LocatedField,
  knownNames: Set<string>,
  prelude: string | undefined,
): ProblemDraft[] {
  const { field } = located;
  const where: string = fieldWhere(field);
  const target: ProblemTarget = fieldTarget(located, "logic");

  // Igual que el export: un campo presentacional no calcula nada, pero sus reglas viajan igual.
  const own: ProblemDraft[] = isPresentationalField(field.type)
    ? []
    : scriptDrafts(field.logic.script ?? "", knownNames, prelude, where, target, SCRIPT_SUBJECT);

  const effects: ProblemDraft[] = (field.logic.rules ?? []).flatMap((rule) =>
    rule.effects.flatMap((effect) =>
      effect.kind === "script"
        ? scriptDrafts(
            effect.source,
            knownNames,
            prelude,
            where,
            target,
            `El efecto de la regla «${nameOrUnnamed(rule.label)}»`,
          )
        : [],
    ),
  );

  return [...own, ...effects];
}

function schemaEmbedsPattern(type: string): boolean {
  return (
    !isPresentationalField(type) &&
    !isOptionBasedField(type) &&
    !TYPES_WITHOUT_PATTERN.includes(type)
  );
}

export function patternProblems(located: LocatedField): ProblemDraft[] {
  const { field } = located;
  if (!schemaEmbedsPattern(field.type)) return [];

  const where: string = fieldWhere(field);
  const target: ProblemTarget = fieldTarget(located, "validations");
  const drafts: ProblemDraft[] = [];

  const baseError: string | null = field.validations.pattern
    ? regexError(field.validations.pattern)
    : null;
  if (baseError) {
    drafts.push({
      severity: "error",
      where,
      message: `${INVALID_PATTERN_MESSAGE} ${baseError}`,
      target,
    });
  }

  for (const override of field.validations.overrides ?? []) {
    const error: string | null = override.validations.pattern
      ? regexError(override.validations.pattern)
      : null;
    if (error) {
      drafts.push({
        severity: "error",
        where,
        message: `${INVALID_OVERRIDE_PATTERN_MESSAGE} ${error}`,
        target,
      });
    }
  }

  return drafts;
}

// El operador `matches` arma un RegExp con el valor. El simulador lo toma como "no coincide" si el
// patron no compila, asi que un error aca no rompe nada a la vista: la condicion nunca se cumple.
export function conditionPatternProblems(located: LocatedField): ProblemDraft[] {
  const { field } = located;
  const where: string = fieldWhere(field);
  const logic: ProblemTarget = fieldTarget(located, "logic");
  const validations: ProblemTarget = fieldTarget(located, "validations");

  const conditions: [FieldCondition | undefined, ProblemTarget][] = [
    [field.visibleWhen, logic],
    [field.enableWhen, logic],
    ...(field.logic.rules ?? []).flatMap((rule) =>
      rule.when.map((condition): [FieldCondition, ProblemTarget] => [condition, logic]),
    ),
    ...(field.validations.overrides ?? []).map((override): [FieldCondition, ProblemTarget] => [
      override.when,
      validations,
    ]),
  ];

  return conditions.flatMap(([condition, target]): ProblemDraft[] => {
    if (condition?.operator !== "matches") return [];

    const source: string = String(condition.value ?? "");
    if (source.length === 0) return [];

    const error: string | null = regexError(source);
    return error
      ? [
          {
            severity: "error",
            where,
            message: `${INVALID_CONDITION_PATTERN_MESSAGE} ${error}`,
            target,
          },
        ]
      : [];
  });
}

// Misma lectura que useApiMappingPanel: una ruta que el contrato no tiene es huerfana, y una hoja
// que pone el aplicativo receptor no es de nadie en el formulario.
export function mappingProblems(located: LocatedField): ProblemDraft[] {
  const binding = located.field.apiBinding;
  if (binding?.kind !== "mapped") return [];

  const leaf: SchemaLeaf | null = resolveLeaf(PAYLOAD_SCHEMA, binding.path);
  const where: string = fieldWhere(located.field);
  const target: ProblemTarget = fieldTarget(located, "apiMapping");

  if (leaf === null) {
    return [
      { severity: "warning", where, message: `${ORPHAN_MAPPING_MESSAGE} ${binding.path}`, target },
    ];
  }

  if (leaf.providedByHost) {
    return [
      { severity: "warning", where, message: `${HOST_MAPPING_MESSAGE} ${binding.path}`, target },
    ];
  }

  return [];
}

// Los tres son errores porque el payload saldria mal sin avisar: sin id el concepto no viaja, con
// el id repetido dos valores se pisan en la misma fila del backend, y dentro de un grupo la lista
// plana lo ignora. El builder no deja meter uno en un grupo; ese solo llega en un JSON editado a
// mano. `owners` se arma una vez para todo el formulario.
export function conceptProblems(
  located: LocatedField,
  owners: Map<number, CanvasField[]>,
): ProblemDraft[] {
  const binding = located.field.apiBinding;
  if (binding?.kind !== "concept" || isPresentationalField(located.field.type)) return [];

  const where: string = fieldWhere(located.field);
  const target: ProblemTarget = fieldTarget(located, "apiMapping");
  const problems: ProblemDraft[] = [];

  if (located.inGroup) {
    problems.push({ severity: "error", where, message: CONCEPT_IN_GROUP_MESSAGE, target });
  }

  if (!isValidConceptId(binding.idConcepto)) {
    problems.push({ severity: "error", where, message: INVALID_CONCEPT_ID_MESSAGE, target });
    return problems;
  }

  const others: CanvasField[] = (owners.get(binding.idConcepto) ?? []).filter(
    (owner) => owner.id !== located.field.id,
  );

  if (others.length > 0) {
    problems.push({
      severity: "error",
      where,
      message: `${DUPLICATE_CONCEPT_ID_MESSAGE} ${binding.idConcepto} (${others.map(fieldWhere).join(", ")})`,
      target,
    });
  }

  return problems;
}

function cssDrafts(
  text: string | undefined,
  prefix: string,
  where: string,
  target: ProblemTarget,
): ProblemDraft[] {
  if (!text) return [];

  const unsupported: string[] = unsupportedDeclarations(text);
  return unsupported.length > 0
    ? [{ severity: "warning", where, message: `${prefix} ${unsupported.join("; ")}`, target }]
    : [];
}

export function fieldCssProblems(located: LocatedField): ProblemDraft[] {
  const { field } = located;
  const where: string = fieldWhere(field);

  return [
    ...cssDrafts(
      field.styles.customCss,
      UNSUPPORTED_CSS_MESSAGE,
      where,
      fieldTarget(located, "styles"),
    ),
    ...cssDrafts(
      field.tooltip?.customCss,
      UNSUPPORTED_TOOLTIP_CSS_MESSAGE,
      where,
      fieldTarget(located, "attributes"),
    ),
  ];
}

export function rowCssProblems(located: LocatedRow): ProblemDraft[] {
  return cssDrafts(located.row.styles?.customCss, UNSUPPORTED_CSS_MESSAGE, located.where, {
    kind: "row",
    rowId: located.row.id,
    canvas: located.canvas,
  });
}

export function groupCheckProblems(
  located: LocatedGroup,
  knownNames: Set<string>,
  prelude: string | undefined,
): ProblemDraft[] {
  const { group, canvas } = located;
  const title: string = group.title.trim();
  const where: string = title.length > 0 ? title : group.name;
  const target: ProblemTarget = { kind: "group", groupId: group.id, canvas };

  // Las apagadas no viajan en el export, asi que tampoco se revisan.
  return enabledChecks(group.checks).flatMap((check) =>
    scriptDrafts(
      check.script,
      knownNames,
      prelude,
      where,
      target,
      `La comprobación «${nameOrUnnamed(check.label)}»`,
    ),
  );
}

// Un solo error por vez: topologicalOrder devuelve el primer ciclo que encuentra. Corregido ese, la
// siguiente exportacion muestra el que quede.
export function cycleProblems(fields: LocatedField[]): ProblemDraft[] {
  const graph: FieldGraph = buildFieldGraph(fields.map((located) => located.field));
  const cycle: string[] | null = topologicalOrder(graph).cycle;
  if (!cycle || cycle.length === 0) return [];

  const first: LocatedField | undefined = fields.find((located) => located.field.id === cycle[0]);
  if (!first) return [];

  return [
    {
      severity: "error",
      where: fieldWhere(first.field),
      message: `${CYCLE_MESSAGE} ${describeCycle(graph, cycle)}`,
      target: fieldTarget(first, "logic"),
    },
  ];
}
