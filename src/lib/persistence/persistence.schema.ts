import { z } from "zod";
import { safeHref } from "../richText/richText.utils";
import { DRAFT_SCHEMA_VERSION } from "./persistence.constants";

// Forma del borrador guardado. Ademas de validar, sanea: aca esta el tercer paso de safeHref,
// despues del editor y del serializador. Hace falta porque un borrador se puede manipular a mano
// desde las devtools, asi que un enlace javascript: podria entrar por esta puerta.

const richTextLeafSchema = z
  .object({
    text: z.string(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    href: z.string().optional(),
  })
  .transform((leaf) => ({ ...leaf, href: safeHref(leaf.href) }));

const richTextContentSchema = z.array(
  z.object({
    type: z.literal("paragraph"),
    children: z.array(richTextLeafSchema),
  }),
);

const fieldValidationRulesSchema = z.object({
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional(),
});

const fieldStylesSchema = z.object({
  customClasses: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
});

const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const fieldFileConfigSchema = z.object({
  acceptedFormats: z.array(z.string()),
  maxSizeMB: z.number(),
});

const fieldTooltipSchema = z.object({
  content: richTextContentSchema,
  position: z.enum(["top", "bottom", "left", "right"]),
  customClasses: z.string().optional(),
});

const fieldConditionSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "startsWith",
    "endsWith",
    "contains",
    "matches",
    "in",
    "isEmpty",
    "isNotEmpty",
    "isTruthy",
    "isFalsy",
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

// Va despues de fieldConditionSchema porque lo necesita. Sin esta rama un borrador con overrides
// los perderia al cargar sin decir nada: z.object descarta las claves que no declara.
const fieldValidationsSchema = fieldValidationRulesSchema.extend({
  overrides: z
    .array(
      z.object({
        id: z.string(),
        when: fieldConditionSchema,
        validations: fieldValidationRulesSchema,
      }),
    )
    .optional(),
});

const ruleEffectSchema = z.discriminatedUnion("kind", [
  z.object({ id: z.string(), kind: z.literal("script"), source: z.string() }),
  z.object({
    id: z.string(),
    kind: z.literal("constant"),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
]);

const fieldRuleSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  matchAll: z.boolean(),
  when: z.array(fieldConditionSchema.extend({ id: z.string() })),
  effects: z.array(ruleEffectSchema),
});

// `dependencies`, `typeScript` y `formula` ya no se declaran: z.object descarta lo que no conoce,
// asi que un borrador viejo entra sin ellos y esas claves mueren solas al volver a guardar.
const fieldLogicSchema = z.object({
  script: z.string().optional(),
  rules: z.array(fieldRuleSchema).optional(),
});

const apiBindingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mapped"), path: z.string() }),
  z.object({ kind: z.literal("excluded") }),
]);

const fieldDataSourceSchema = z.object({
  catalog: z.string(),
  dependsOn: z.string().optional(),
  fills: z
    .array(z.object({ column: z.enum(["id", "label", "code", "tarifa"]), field: z.string() }))
    .optional(),
});

const canvasFieldSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string(),
  label: z.string(),
  colStart: z.number().optional(),
  colSpan: z.number(),
  validations: fieldValidationsSchema,
  styles: fieldStylesSchema,
  logic: fieldLogicSchema,
  title: z.string().optional(),
  options: z.array(fieldOptionSchema).optional(),
  fileConfig: fieldFileConfigSchema.optional(),
  alwaysDisabled: z.boolean().optional(),
  enableWhen: fieldConditionSchema.optional(),
  visibleWhen: fieldConditionSchema.optional(),
  apiBinding: apiBindingSchema.optional(),
  dataSource: fieldDataSourceSchema.optional(),
  labelFor: z.string().optional(),
  content: richTextContentSchema.optional(),
  tooltip: fieldTooltipSchema.optional(),
  // Sin esta linea la propiedad se pierde sola: z.object descarta lo que el esquema no declara,
  // asi que el borrador guardaria el redondeo y al recargar volveria sin el y sin un solo aviso.
  rounding: z.boolean().optional(),
  formatted: z.boolean().optional(),
  allowsNegative: z.boolean().optional(),
  decimals: z.number().optional(),
});

const canvasRowSchema = z.object({
  id: z.string(),
  columns: z.number(),
  fields: z.array(canvasFieldSchema),
  groupId: z.string().optional(),
});

const groupCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  script: z.string(),
  message: z.string(),
});

const repeatableGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  min: z.number(),
  max: z.number(),
  arrayPath: z.string().optional(),
  checks: z.array(groupCheckSchema).optional(),
});

const stepSchema = z.object({
  stepId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  rows: z.array(canvasRowSchema),
  groups: z.array(repeatableGroupSchema).optional(),
});

const savedComponentSchema = canvasFieldSchema.omit({ colStart: true }).extend({
  name: z.string(),
});

const setupConfigSchema = z.object({
  isComplete: z.boolean(),
  formType: z
    .enum(["industria_comercio", "retencion_industria_comercio", "autorretencion"])
    .nullable(),
  hasIntroModal: z.boolean(),
  introModalSteps: z.number(),
});

// La version va como literal y no como numero: un borrador que la cadena de migraciones no pudo
// llevar hasta la actual tiene que ser rechazado aca, no cargado a medias.
export const draftPayloadSchema = z.object({
  schemaVersion: z.literal(DRAFT_SCHEMA_VERSION),
  formSteps: z.array(stepSchema),
  introModal: z.object({ steps: z.array(stepSchema) }),
  formScript: z.string(),
  savedComponents: z.array(savedComponentSchema),
  setupConfig: setupConfigSchema,
  savedAt: z.string(),
});
