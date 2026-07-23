import { z } from "zod";

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

const fieldLogicSchema = z.object({
  dependencies: z.array(z.string()),
  typeScript: z.string(),
});

const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const fieldFileConfigSchema = z.object({
  acceptedFormats: z.array(z.string()),
  maxSizeMB: z.number(),
});

const enableConditionSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "isEmpty",
    "isNotEmpty",
    "isTruthy",
    "isFalsy",
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const apiBindingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("mapped"), path: z.string() }),
  z.object({ kind: z.literal("excluded") }),
]);

const canvasFieldSchema = z.object({
  id: z.string(),
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
  enableWhen: enableConditionSchema.optional(),
  apiBinding: apiBindingSchema.optional(),
});

const canvasRowSchema = z.object({
  id: z.string(),
  columns: z.number(),
  fields: z.array(canvasFieldSchema),
});

const stepSchema = z.object({
  stepId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  rows: z.array(canvasRowSchema),
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
