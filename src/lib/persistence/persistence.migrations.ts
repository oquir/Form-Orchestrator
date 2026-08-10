import { formulaToScript } from "../scriptMigration/scriptMigration";
import { DRAFT_SCHEMA_VERSION } from "./persistence.constants";
import type { DraftMigration, FieldMigration, LooseDraft } from "./persistence.types";

// Cadena de migraciones del borrador. Existe porque el borrador vive en localStorage y la forma
// del store cambia seguido: sin version, cada cambio de shape hace que Zod rechace lo guardado y
// el usuario pierda el trabajo con "borrador invalido" como unica explicacion.
//
// Van indexadas por la version de la que salen: MIGRATIONS[1] lleva de 1 a 2. Trabajan sobre el
// objeto crudo, antes de validar, y por eso no pueden suponerle forma a nada: lo unico que hacen
// es agregar o transformar claves y dejar que Zod juzgue el resultado.

function isRecord(value: unknown): value is LooseDraft {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapStepFields(step: unknown, migrate: FieldMigration): unknown {
  if (!isRecord(step) || !Array.isArray(step.rows)) return step;

  return {
    ...step,
    rows: step.rows.map((row) => {
      if (!isRecord(row) || !Array.isArray(row.fields)) return row;

      return {
        ...row,
        fields: row.fields.map((field) => (isRecord(field) ? migrate(field) : field)),
      };
    }),
  };
}

// Los tres sitios donde vive un campo. El almacen de partes cuenta: sus componentes guardan su
// propio `logic` y sin esto quedarian hablando el lenguaje viejo al soltarlos en un lienzo.
function mapDraftFields(draft: LooseDraft, migrate: FieldMigration): LooseDraft {
  const introModal: unknown = draft.introModal;

  return {
    ...draft,
    formSteps: Array.isArray(draft.formSteps)
      ? draft.formSteps.map((step) => mapStepFields(step, migrate))
      : draft.formSteps,
    introModal:
      isRecord(introModal) && Array.isArray(introModal.steps)
        ? { ...introModal, steps: introModal.steps.map((step) => mapStepFields(step, migrate)) }
        : introModal,
    savedComponents: Array.isArray(draft.savedComponents)
      ? draft.savedComponents.map((component) =>
          isRecord(component) ? migrate(component) : component,
        )
      : draft.savedComponents,
  };
}

// Una formula que no parsea no se tira ni se lleva puesto el borrador entero: se conserva como
// comentario dentro del script, donde el autor la ve y la puede terminar de escribir. El campo
// deja de calcular -- undefined conserva lo que escriba el usuario -- en vez de inventar un valor.
//
// El caso es real y no defensivo: el editor de formulas guardaba lo que se tipeara aunque no
// compilara, asi que un autoguardado a mitad de una palabra deja exactamente esto. Descartar el
// borrador entero por un campo a medio escribir seria un castigo desproporcionado, y dejarlo caer
// en silencio -- que es lo que hace Zod ahora que el esquema ya no declara `formula` -- es peor.
function preservedFormula(formula: string): string {
  const quoted: string = formula
    .split("\n")
    .map((line) => `// ${line}`)
    .join("\n");

  return `// Esta formula no se pudo traducir al migrar. Reescribila como script:\n${quoted}\nreturn undefined;`;
}

function formulaToScriptField(field: LooseDraft): LooseDraft {
  const logic: unknown = field.logic;
  if (!isRecord(logic) || typeof logic.formula !== "string") return field;

  const { formula, ...rest } = logic;

  return {
    ...field,
    logic: { ...rest, script: formulaToScript(formula) ?? preservedFormula(formula) },
  };
}

function formulaToScriptEffect(effect: unknown): unknown {
  if (!isRecord(effect) || effect.kind !== "formula" || typeof effect.expression !== "string") {
    return effect;
  }

  return {
    id: effect.id,
    kind: "script",
    source: formulaToScript(effect.expression) ?? preservedFormula(effect.expression),
  };
}

function ruleFormulasToScripts(field: LooseDraft): LooseDraft {
  const logic: unknown = field.logic;
  if (!isRecord(logic) || !Array.isArray(logic.rules)) return field;

  return {
    ...field,
    logic: {
      ...logic,
      rules: logic.rules.map((rule) => {
        if (!isRecord(rule) || !Array.isArray(rule.effects)) return rule;

        return { ...rule, effects: rule.effects.map(formulaToScriptEffect) };
      }),
    },
  };
}

const MIGRATIONS: Record<number, DraftMigration> = {
  // 1 -> 2: aparece el preludio del formulario.
  1: (draft) => ({ ...draft, formScript: "" }),
  // 2 -> 3: la formula pasa a ser un script.
  2: (draft) => mapDraftFields(draft, formulaToScriptField),
  // 3 -> 4: los efectos de regla dejan la formula y hablan el mismo lenguaje que el campo.
  3: (draft) => mapDraftFields(draft, ruleFormulasToScripts),
};

// Un hueco en la cadena corta el recorrido y devuelve el borrador con su version vieja, que es
// exactamente lo que el esquema rechaza despues. Preferible a estamparle una version que no tiene.
export function migrateDraft(draft: LooseDraft): LooseDraft {
  let current: LooseDraft = draft;
  let version: number = typeof draft.schemaVersion === "number" ? draft.schemaVersion : 1;

  while (version < DRAFT_SCHEMA_VERSION) {
    const step: DraftMigration | undefined = MIGRATIONS[version];
    if (!step) return current;

    version += 1;
    current = { ...step(current), schemaVersion: version };
  }

  return current;
}
