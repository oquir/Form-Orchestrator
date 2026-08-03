import { z } from "zod";
import { safeHref } from "../richText/richText.utils";

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

const fieldValidationsSchema = z.object({
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

const ruleEffectSchema = z.discriminatedUnion("kind", [
  z.object({ id: z.string(), kind: z.literal("formula"), expression: z.string() }),
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

const fieldLogicSchema = z.object({
  dependencies: z.array(z.string()),
  typeScript: z.string(),
  formula: z.string().optional(),
  rules: z.array(fieldRuleSchema).optional(),
});

const apiBindingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mapped"), path: z.string() }),
  z.object({ kind: z.literal("excluded") }),
]);

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
  labelFor: z.string().optional(),
  content: richTextContentSchema.optional(),
  tooltip: fieldTooltipSchema.optional(),
});

const canvasRowSchema = z.object({
  id: z.string(),
  columns: z.number(),
  fields: z.array(canvasFieldSchema),
  groupId: z.string().optional(),
});

const repeatableGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  min: z.number(),
  max: z.number(),
  arrayPath: z.string().optional(),
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

export const draftPayloadSchema = z.object({
  formSteps: z.array(stepSchema),
  introModal: z.object({ steps: z.array(stepSchema) }),
  savedComponents: z.array(savedComponentSchema),
  setupConfig: setupConfigSchema,
  savedAt: z.string(),
});
