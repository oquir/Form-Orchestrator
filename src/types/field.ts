import type { CatalogColumn } from "./catalog";
import type { PhoneKind } from "./fieldContact";
import type { DateBound, DateFormatId } from "./fieldDate";
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
  // Solo campos fecha: lo mas temprano y lo mas tarde que se acepta. Ver lib/dateBound.
  minDate?: DateBound;
  maxDate?: DateBound;
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
  customCss?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Mapa CSS plano, camelCase, listo para el `style` de React. Es lo que sale al exportar en vez de
// clases de Tailwind: el consumidor no tiene su fuente escaneado por Tailwind, asi que una clase
// solo se aplicaria ahi por casualidad. Ver lib/cssStyles.
export type CssStyleMap = Record<string, string>;

// El calculo de un campo vive en un solo lugar: `script`, codigo con {{campo}} para leer a los
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
  customCss?: string;
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

// El efecto habla el mismo lenguaje que `logic.script` -- {{campo}} y un return que da el valor --
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
  // Texto fijo antes y despues del numero ($, X1000, kW). Solo presentacion, como `formatted`: el
  // valor sigue siendo el numero y el prefijo nunca entra en el. Ver lib/fieldAffix.
  prefix?: string;
  suffix?: string;
  // Solo telefono: que numero pide, y con eso que patron de fabrica valida. Ausente es celular, y
  // por eso el store solo guarda "fijo". Ver lib/fieldContact.
  phoneKind?: PhoneKind;
  // Dibujar las opciones en una sola linea en vez de una debajo de otra. Solo presentacion, y solo
  // para radio_group y checkbox_group; ver lib/fieldOptions.
  inlineOptions?: boolean;
  // Un campo fecha que pide un rango en vez de una sola fecha: el valor pasa a ser
  // { desde, hasta }. Cambia la forma del valor, no solo como se ve; ver lib/fieldDate.
  dateRange?: boolean;
  // Un campo fecha que pide tambien la hora, en una sola fecha o en las dos puntas del rango: el
  // valor pasa de AAAA-MM-DD a AAAA-MM-DDTHH:mm. Solo cuando el municipio lo pide.
  includesTime?: boolean;
  // Como se ve la fecha y como viaja a la API. Por dentro el valor sigue en AAAA-MM-DD; el formato
  // se aplica solo en el input y en el payload. Ausente = el input del navegador. Ver lib/dateFormat.
  dateFormat?: DateFormatId;
}
