import type { CatalogColumn } from "./catalog";
import type { RichTextContent } from "./richText";

// Lo que una condicion puede cambiar. Vive aparte de FieldValidations para que un override no
// pueda anidar otros overrides: una sola capa, sin recursion que resolver.
export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

// Cuando `when` se cumple, estas reglas se fusionan sobre las de base. Lo que el override no
// declara se hereda: uno que solo trae `pattern` no se lleva por delante el `required` de abajo.
export interface FieldValidationOverride {
  id: string;
  when: FieldCondition;
  validations: FieldValidationRules;
}

export interface FieldValidations extends FieldValidationRules {
  // En orden: gana el primero que se cumpla. El consumidor aplica la misma regla.
  overrides?: FieldValidationOverride[];
}

export interface FieldStyles {
  customClasses?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
}

// El calculo de un campo vive en un solo lugar: `script`, codigo con {campo} para leer a los
// demas. Las reglas siguen aparte porque no son otro lenguaje sino una estructura declarativa
// encima del mismo: condicion mas efecto, y el efecto habla este script.
export interface FieldLogic {
  script?: string;
  rules?: FieldRule[];
}

export interface FieldOption {
  id: string;
  label: string;
}

export interface FieldFileConfig {
  acceptedFormats: string[];
  maxSizeMB: number;
}

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface FieldTooltip {
  content: RichTextContent;
  position: TooltipPosition;
  customClasses?: string;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "startsWith"
  | "endsWith"
  | "contains"
  | "matches"
  | "in"
  | "isEmpty"
  | "isNotEmpty"
  | "isTruthy"
  | "isFalsy";

export type ConditionKind = "enable" | "visible";

export interface FieldCondition {
  fieldId: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface RuleCondition extends FieldCondition {
  id: string;
}

// El efecto habla el mismo lenguaje que `logic.script` -- {campo} y un return que da el valor --
// y no el de formulas. Las reglas siguen siendo una estructura declarativa, pero un solo lenguaje
// de calculo en todo el aplicativo: dos era el problema que este cambio vino a sacar.
export type RuleEffect =
  | { id: string; kind: "script"; source: string }
  | { id: string; kind: "constant"; value: string | number | boolean };

export interface FieldRule {
  id: string;
  label?: string;
  matchAll: boolean;
  when: RuleCondition[];
  effects: RuleEffect[];
}

export type ApiBinding = { kind: "mapped"; path: string } | { kind: "excluded" };

// Que columna de la opcion elegida se copia a que campo. Vive en el campo que ORIGINA la
// seleccion y no en los que se llenan: un solo dueno, sin dos puntas que mantener sincronizadas,
// igual que labelFor.
export interface CatalogFill {
  column: CatalogColumn;
  // Id del campo destino; se resuelve a nombre al exportar, como dependsOn.
  field: string;
}

// Que catalogo alimenta las opciones del campo. `dependsOn` guarda el id del campo que
// parametriza la consulta (departamento -> municipios) y se resuelve a nombre al exportar.
// `fills` es lo que hace que al elegir una actividad se llenen solos su codigo CIIU y su tarifa.
export interface FieldDataSource {
  catalog: string;
  dependsOn?: string;
  fills?: CatalogFill[];
}

export interface CanvasField {
  id: string;
  name: string;
  type: string;
  label: string;
  colStart: number;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: FieldCondition;
  visibleWhen?: FieldCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  labelFor?: string;
  content?: RichTextContent;
  tooltip?: FieldTooltip;
  // Aproximar al millar mas cercano. Es un booleano y no un multiplo porque en los formularios
  // que existen nunca aparecio otro redondeo; el multiplo vive en lib/fieldRounding.
  rounding?: boolean;
  // Mostrar el valor con punto de miles y coma decimal. Es solo presentacion: el valor guardado
  // sigue siendo un numero, nunca el texto formateado. Ver lib/numberFormat.
  formatted?: boolean;
  // Ausente significa que SI admite negativos: solo el false restringe. La polaridad va al reves
  // que las dos de arriba a proposito, para no poner a recortar los borradores ya guardados.
  allowsNegative?: boolean;
  // Cuantos decimales muestra y deja teclear. Ausente = los que traiga, hasta el tope de la lib.
  // Recorta el valor ademas de rellenarlo al mostrar; ver lib/fieldRounding.
  decimals?: number;
}

export interface SavedComponent {
  id: string;
  name: string;
  type: string;
  label: string;
  colSpan: number;
  validations: FieldValidations;
  styles: FieldStyles;
  logic: FieldLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: FieldCondition;
  visibleWhen?: FieldCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  tooltip?: FieldTooltip;
  rounding?: boolean;
  formatted?: boolean;
  allowsNegative?: boolean;
  decimals?: number;
}
