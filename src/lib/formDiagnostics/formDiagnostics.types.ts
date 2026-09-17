import type { CanvasField } from "../../types/field";
import type { FormProblem } from "../../types/formDiagnostics";
import type { CanvasRow, RepeatableGroup } from "../../types/formStructure";
import type { CanvasTarget } from "../../types/placement";

// Un problema antes de numerarlo: el id se pone al final, cuando ya esta el orden de la lista.
export type ProblemDraft = Omit<FormProblem, "id">;

export interface LocatedField {
  field: CanvasField;
  canvas: CanvasTarget;
}

export interface LocatedRow {
  row: CanvasRow;
  canvas: CanvasTarget;
  where: string;
}

export interface LocatedGroup {
  group: RepeatableGroup;
  canvas: CanvasTarget;
}

export interface LocatedItems {
  fields: LocatedField[];
  rows: LocatedRow[];
  groups: LocatedGroup[];
}

// `prelude` es el texto con el que se validan los scripts, o undefined si el preludio no compila.
export interface PreludeCheck {
  problems: ProblemDraft[];
  prelude: string | undefined;
}
