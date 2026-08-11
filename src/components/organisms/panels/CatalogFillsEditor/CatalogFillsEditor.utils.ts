import { isPresentationalField } from "../../../../lib/fieldKind/fieldKind";
import type { CanvasField, CatalogFill } from "../../../../types/field";

// Los candidatos a recibir una columna: cualquier campo con valor del mismo lienzo, menos el que
// origina la seleccion. No se filtra por tipo -- el codigo CIIU es texto y la tarifa es numero --
// ni por si ya esta elegido, porque repetir un destino en dos filas es un error del autor y se ve
// solo, mientras que esconderlo dejaria la lista cambiando debajo del mouse.
export function fillTargetCandidates(fields: CanvasField[], sourceId: string): CanvasField[] {
  return fields.filter(
    (candidate) => candidate.id !== sourceId && !isPresentationalField(candidate.type),
  );
}

export function replaceFill(fills: CatalogFill[], index: number, next: CatalogFill): CatalogFill[] {
  return fills.map((fill, position) => (position === index ? next : fill));
}

export function removeFill(fills: CatalogFill[], index: number): CatalogFill[] {
  return fills.filter((_, position) => position !== index);
}
