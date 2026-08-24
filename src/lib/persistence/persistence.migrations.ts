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

// Los dos lienzos donde vive un campo. Hasta la version 5 habia un tercero, el almacen de partes,
// cuyos componentes guardaban su propio `logic`; las migraciones 2 y 3 lo recorrian por eso. Se
// sigue mapeando `savedComponents` si el borrador lo trae, porque las migraciones viejas corren
// antes que la 4 -> 5 que lo borra, y un componente a medio migrar podria romper el paso siguiente.
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

// Tabla chica: cubre lo que alguien tipea de verdad en ese cuadro para un campo de formulario.
// Lo que no esta ahi no se inventa -- se conserva como comentario CSS, igual que preservedFormula
// conserva una formula que no compilaba.
const TAILWIND_TO_CSS: Record<string, string> = {
  "font-bold": "font-weight: 700",
  "font-semibold": "font-weight: 600",
  "font-medium": "font-weight: 500",
  "font-normal": "font-weight: 400",
  italic: "font-style: italic",
  "not-italic": "font-style: normal",
  underline: "text-decoration: underline",
  uppercase: "text-transform: uppercase",
  lowercase: "text-transform: lowercase",
  capitalize: "text-transform: capitalize",
  "text-left": "text-align: left",
  "text-center": "text-align: center",
  "text-right": "text-align: right",
  "text-justify": "text-align: justify",
  hidden: "display: none",
  block: "display: block",
  "inline-block": "display: inline-block",
  flex: "display: flex",
};

function classesToCss(classes: string): string {
  const tokens: string[] = classes.split(/\s+/).filter((token) => token.length > 0);
  const mapped: string[] = [];
  const unmapped: string[] = [];

  for (const token of tokens) {
    const css: string | undefined = TAILWIND_TO_CSS[token];
    if (css) mapped.push(`${css};`);
    else unmapped.push(token);
  }

  if (unmapped.length > 0) {
    mapped.push(
      `/* Estas clases de Tailwind no se pudieron traducir al migrar, reescribilas como CSS: ${unmapped.join(" ")} */`,
    );
  }

  return mapped.join("\n");
}

// `customClasses` en un objeto de estilos (campo, fila o tooltip) pasa a `customCss` con la
// traduccion de arriba. `holder` es generico porque los tres casos comparten la misma forma de
// migracion aunque vivan en claves distintas del campo (`styles`, `tooltip`).
function migrateStyleHolder(holder: unknown): unknown {
  if (!isRecord(holder) || typeof holder.customClasses !== "string") return holder;

  const { customClasses, ...rest } = holder;

  return { ...rest, customCss: classesToCss(customClasses) };
}

function fieldClassesToCss(field: LooseDraft): LooseDraft {
  return {
    ...field,
    styles: migrateStyleHolder(field.styles),
    tooltip: migrateStyleHolder(field.tooltip),
  };
}

function rowClassesToCss(row: LooseDraft): LooseDraft {
  return { ...row, styles: migrateStyleHolder(row.styles) };
}

type RowMigration = (row: LooseDraft) => LooseDraft;

function mapStepRows(step: unknown, migrate: RowMigration): unknown {
  if (!isRecord(step) || !Array.isArray(step.rows)) return step;

  return {
    ...step,
    rows: step.rows.map((row) => (isRecord(row) ? migrate(row) : row)),
  };
}

// mapDraftFields ya sabe recorrer los dos lienzos, pero solo llega a `row.fields`: los estilos de
// la fila viven un nivel mas arriba, asi que hace falta un recorrido propio para `row.styles`.
function mapDraftRows(draft: LooseDraft, migrate: RowMigration): LooseDraft {
  const introModal: unknown = draft.introModal;

  return {
    ...draft,
    formSteps: Array.isArray(draft.formSteps)
      ? draft.formSteps.map((step) => mapStepRows(step, migrate))
      : draft.formSteps,
    introModal:
      isRecord(introModal) && Array.isArray(introModal.steps)
        ? { ...introModal, steps: introModal.steps.map((step) => mapStepRows(step, migrate)) }
        : introModal,
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
  // 4 -> 5: se elimina el almacen de partes. Mover campos entre pasos lo dejo sin uso.
  //
  // Se borra la clave a proposito en vez de dejar que Zod la ignore: el esquema usa z.object, que
  // descarta lo que no declara, asi que el borrador validaria igual -- pero seguiria arrastrando
  // los componentes en localStorage para siempre, invisibles y sin nada que los pueda leer.
  4: (draft) => {
    const { savedComponents, ...resto } = draft;

    return resto;
  },
  // 5 -> 6: las clases de Tailwind del campo, la fila y el tooltip pasan a ser CSS plano. Tailwind
  // escanea el fuente del consumidor, no el JSON exportado, asi que una clase ahi solo funcionaba
  // por casualidad.
  5: (draft) => mapDraftRows(mapDraftFields(draft, fieldClassesToCss), rowClassesToCss),
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
