import type { CanvasField } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { TransferCheck, TransferPayload } from "../../types/transfer";
import { findLabelFor } from "../fieldKind/fieldKind";
import { findNearestFit, getFreeRuns, sortByColumn } from "../rowLayout/rowLayout";

// Mudanzas entre pasos, como funciones puras: sin React y sin el store. Es el nucleo compartido por
// las dos cargas -un campo o una fila entera- para que las reglas no se dupliquen. Cuando aparezca
// la tercera carga, aqui solo se agrega el caso; las reglas ya estan escritas.
//
// El nombre no entra en juego: allFieldNames ya es global a los dos lienzos, asi que un campo
// mudado conserva su name y su id, y ninguna referencia por id se rompe por el hecho de mudarse.

const ALLOWED: TransferCheck = { allowed: true };

export function canTransfer(rows: CanvasRow[], payload: TransferPayload): TransferCheck {
  if (payload.kind === "field") {
    const exists: boolean = rows.some((row) =>
      row.fields.some((field) => field.id === payload.fieldId),
    );

    return exists ? ALLOWED : { allowed: false, reason: "El campo ya no existe." };
  }

  const row: CanvasRow | undefined = rows.find((candidate) => candidate.id === payload.rowId);
  if (!row) return { allowed: false, reason: "La fila ya no existe." };

  // Misma regla que al reordenar: arrastrar una fila nunca la saca de su grupo. Mudarla de paso la
  // sacaria por definicion, porque el grupo vive en groups[] del paso de origen.
  if (row.groupId !== undefined) {
    return { allowed: false, reason: "Una fila de un grupo repetible no se puede mover de paso." };
  }

  return ALLOWED;
}

// Los que viajan juntos. El vinculo de labelFor se mira en los dos sentidos: da igual si agarraste
// el campo o su etiqueta, la pareja se muda entera o el labelFor quedaria apuntando a otra pantalla.
// La etiqueta va primero para que aterrice a la izquierda de su campo, que es donde se espera.
export function transferGroup(rows: CanvasRow[], fieldId: string): CanvasField[] {
  const fields: CanvasField[] = rows.flatMap((row) => row.fields);
  const field: CanvasField | undefined = fields.find((candidate) => candidate.id === fieldId);
  if (!field) return [];

  const partner: CanvasField | null = field.labelFor
    ? (fields.find((candidate) => candidate.id === field.labelFor) ?? null)
    : findLabelFor(fields, fieldId);

  if (!partner) return [field];

  return field.labelFor ? [field, partner] : [partner, field];
}

// Coloca en el paso destino los campos que viajan juntos y devuelve sus filas ya resueltas. Se
// prueba fila por fila y, si ninguna tiene hueco, se pide una nueva: rechazar la mudanza dejaria al
// usuario haciendo sitio a mano en un paso que ni siquiera esta viendo.
export function planLanding(
  rows: CanvasRow[],
  moving: CanvasField[],
  createRow: () => CanvasRow,
): CanvasRow[] {
  const result: CanvasRow[] = rows.map((row) => ({ ...row, fields: [...row.fields] }));

  for (const field of moving) {
    let landed = false;

    for (const row of result) {
      // Un grupo repetible no recibe mudanzas: el campo caeria dentro de un item del array sin que
      // nadie lo haya pedido, y con el apiBinding que trae eso es un mapeo silencioso.
      if (row.groupId !== undefined) continue;

      // A proposito no se usa resolvePlacement: su ultimo recurso mete el campo recortado en el
      // tramo mas ancho. Soltandolo a mano eso esta bien, porque lo estas viendo; mudandolo a un
      // paso que no tenes delante seria estrecharlo sin avisar. O entra entero, o se busca otra
      // fila. El ancho es del campo, no del sitio donde cae.
      const colStart: number | null =
        field.colSpan <= row.columns
          ? findNearestFit(getFreeRuns(row.fields, row.columns), 1, field.colSpan)
          : null;

      if (colStart === null) continue;

      row.fields = sortByColumn([...row.fields, { ...field, colStart }]);
      landed = true;
      break;
    }

    if (landed) continue;

    // La pareja se intenta mantener junta, pero si no cabe en ninguna parte se separa antes que
    // rechazar la mudanza: un campo a 16 columnas y su etiqueta no entran en la misma fila.
    const fresh: CanvasRow = createRow();

    fresh.fields = [{ ...field, colStart: 1, colSpan: Math.min(field.colSpan, fresh.columns) }];
    result.push(fresh);
  }

  return result;
}

// Referencias por id que quedan con un extremo en el modal de entrada y el otro en el formulario.
// Siguen funcionando en runtime -el modal se responde antes que el formulario, asi que el valor ya
// esta ahi-, pero LogicPanel solo ofrece candidatos de formSteps y dejan de poder editarse desde el
// panel. Por eso se avisa en vez de borrarlas: el dato es valido, lo corto es el selector.
export function collectCrossingRefs(otherSideRows: CanvasRow[], moving: CanvasField[]): string[] {
  const otherFields: CanvasField[] = otherSideRows.flatMap((row) => row.fields);
  const otherIds = new Set<string>(otherFields.map((field) => field.id));
  const movingIds = new Set<string>(moving.map((field) => field.id));
  const labels = new Set<string>();

  for (const field of moving) {
    if (referencedIds(field).some((id) => otherIds.has(id))) labels.add(field.label);
  }

  for (const field of otherFields) {
    if (referencedIds(field).some((id) => movingIds.has(id))) labels.add(field.label);
  }

  return [...labels];
}

// Las mismas fuentes por id que removeField limpia al borrar un campo. Las referencias de un
// script van por nombre y no por id, asi que no entran aqui: el nombre viaja con el campo.
function referencedIds(field: CanvasField): string[] {
  const ids: string[] = [];

  if (field.enableWhen) ids.push(field.enableWhen.fieldId);
  if (field.visibleWhen) ids.push(field.visibleWhen.fieldId);
  if (field.labelFor) ids.push(field.labelFor);
  if (field.dataSource?.dependsOn) ids.push(field.dataSource.dependsOn);

  for (const rule of field.logic.rules ?? []) {
    for (const condition of rule.when) ids.push(condition.fieldId);
  }

  for (const override of field.validations.overrides ?? []) {
    ids.push(override.when.fieldId);
  }

  return ids;
}
