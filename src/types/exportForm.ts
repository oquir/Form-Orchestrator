import type {
  ApiBinding,
  ConditionOperator,
  CssStyleMap,
  FieldCondition,
  FieldDataSource,
  FieldFileConfig,
  FieldOption,
  TooltipPosition,
} from "./field";
import type { DateFormatId } from "./fieldDate";
import type { DraftPayload } from "./persistenceTypes";
import type { RichTextContent } from "./richText";
import type { FormType } from "./setup";

export interface ExportedCondition {
  field: string;
  operator: ConditionOperator;
  value?: FieldCondition["value"] | string[];
}

// El efecto de script sale compilado igual que el del campo, y con la misma forma: para el
// consumidor son el mismo tipo de cosa y se ejecutan por el mismo camino.
export type ExportedRuleEffect =
  | { id: string; kind: "script"; script: ExportedScript }
  | { id: string; kind: "constant"; value: string | number | boolean };

export interface ExportedRule {
  id: string;
  label?: string;
  matchAll: boolean;
  when: ExportedCondition[];
  effects: ExportedRuleEffect[];
}

export interface ExportedValidationVariant {
  when: ExportedCondition;
  zodSchema: string;
}

// El consumidor recorre `zodSchemaWhen` en orden y se queda con el primero cuya condicion se
// cumpla; si ninguna se cumple, valida con `zodSchema`. La ausencia de `zodSchema` sigue siendo
// como sabe que un campo presentacional no valida nada.
export interface ExportedValidations {
  zodSchema?: string;
  zodSchemaWhen?: ExportedValidationVariant[];
}

// `compiled` es cuerpo de funcion listo para new Function, sin el preludio del formulario: ese
// viaja una sola vez en formSchema.prelude y quien ejecuta lo antepone. `source` viaja solo para
// poder reeditarlo: ejecutarlo seria un error, porque {{campo}} no es JS. `reads` son los nombres
// que lee, para poder ordenar el calculo sin volver a parsear.
export interface ExportedScript {
  source: string;
  compiled: string;
  reads: string[];
}

export interface ExportedLogic {
  script?: ExportedScript;
  rules?: ExportedRule[];
}

// El contenido es el mismo RichTextContent que el modelo -- ya paso por el sanitizador al
// serializarse -- pero `styles` sale resuelto a CSS plano, igual que el del campo: el consumidor
// no interpreta clases, aplica un objeto.
export interface ExportedTooltip {
  content: RichTextContent;
  position: TooltipPosition;
  styles: CssStyleMap;
}

export interface ExportedField {
  fieldId: string;
  name: string;
  type: string;
  label: string;
  colStart: number;
  colSpan: number;
  // Mapa CSS plano listo para `style`, nunca clases: ver lib/cssStyles. Siempre presente, aunque
  // sea `{}` -- a diferencia de ExportedRow.styles, que es opcional.
  styles: CssStyleMap;
  validations: ExportedValidations;
  logic: ExportedLogic;
  title?: string;
  options?: FieldOption[];
  fileConfig?: FieldFileConfig;
  alwaysDisabled?: boolean;
  enableWhen?: ExportedCondition;
  visibleWhen?: ExportedCondition;
  apiBinding?: ApiBinding;
  dataSource?: FieldDataSource;
  labelFor?: string;
  content?: RichTextContent;
  tooltip?: ExportedTooltip;
  rounding?: boolean;
  formatted?: boolean;
  // Solo aparece cuando vale false. Si no viene, el campo admite negativos.
  allowsNegative?: boolean;
  decimals?: number;
  // Solo en un campo numerico que los declare, ya recortados. Se dibujan al lado del input y nunca
  // entran en el valor; ver lib/fieldAffix.
  prefix?: string;
  suffix?: string;
  inlineOptions?: boolean;
  // Solo aparece en un campo fecha que pide rango: su valor es { desde, hasta } y no un texto.
  dateRange?: boolean;
  // Solo aparece en un campo fecha que pide hora: su valor es AAAA-MM-DDTHH:mm, sin huso.
  includesTime?: boolean;
  // Solo en un campo fecha con formato. El consumidor lo usa en dos bordes: para mostrar la fecha y
  // al armar el payload. Valida y compara siempre sobre AAAA-MM-DD; ver lib/dateFormat.
  dateFormat?: DateFormatId;
  // Tope de longitud para el input. En texto son caracteres y en numero digitos de la parte
  // entera; la regla completa esta en lib/fieldLength. Va ademas del schema, no en lugar del: el
  // schema es lo que valida y esto es lo que frena el tecleo antes de que el valor exista.
  maxLength?: number;
}

// Una comprobacion del grupo entero, con el script ya compilado igual que el de un campo: para el
// consumidor es el mismo tipo de cosa y se ejecuta por el mismo camino. Se evalua en el ambito
// raiz, donde la columna del grupo es el array completo. Verdadero pasa, falso muestra `message`.
// Una comprobacion apagada no llega hasta aca: se filtra al exportar.
export interface ExportedGroupCheck {
  id: string;
  label: string;
  script: ExportedScript;
  message: string;
}

export interface ExportedRepeatableGroup {
  groupId: string;
  name: string;
  title: string;
  min: number;
  max: number;
  arrayPath?: string;
  zodSchema: string;
  checks?: ExportedGroupCheck[];
}

export interface ExportedRow {
  rowId: string;
  columns: number;
  groupId?: string;
  // Ausente cuando la fila no tiene nada que decir -- JSON.stringify descarta undefined, asi que
  // una fila sin estilos serializa sin la clave.
  styles?: CssStyleMap;
  fields: ExportedField[];
}

export interface ExportedStep {
  stepId: string;
  title: string;
  subtitle?: string;
  rows: ExportedRow[];
  groups?: ExportedRepeatableGroup[];
}

export interface ProjectMeta {
  formId: string;
  formType: FormType | null;
  // Fija en "1.0.0" y no dice nada: sigue porque el consumidor ya la tipa. Lo que dice si un
  // consumidor puede con este formulario es `requires`.
  version: string;
  createdAt: string;
  // Lo que un consumidor tiene que saber hacer para ejecutar ESTE formulario sin perder nada en
  // silencio. Si no reconoce alguna palabra, no lo carga. Ver lib/formRequires.
  requires: string[];
}

export interface ExportedIntroModal {
  steps: ExportedStep[];
}

export interface ExportedSetupConfig {
  hasIntroModal: boolean;
  introModal?: ExportedIntroModal;
}

export interface ExportedFormSchema {
  gridBaseColumns: number;
  // Funciones y constantes compartidas por todos los scripts. Va una sola vez y no repetido
  // dentro de cada `compiled`: quien ejecute lo antepone al cuerpo del campo.
  prelude?: string;
  steps: ExportedStep[];
}

export interface FormExport {
  projectMeta: ProjectMeta;
  setupConfig: ExportedSetupConfig;
  formSchema: ExportedFormSchema;
}

// Lo que baja el boton Exportar: el contrato mas `builderDraft`, la copia del proyecto con la que
// el builder lo vuelve a abrir. El consumidor no la lee y tiene que ignorarla.
export type FormExportFile = FormExport & { builderDraft: DraftPayload };
