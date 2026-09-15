import { FORM_TYPES } from "../../constants/formType";
import type { DraftLoad, DraftPayload } from "../../types/persistenceTypes";
import type { ProjectFileLoad, ProjectFileSummary } from "../../types/projectFile";
import { isNewerDraft, parseDraft } from "../persistence/persistence";
import {
  DAMAGED_MESSAGE,
  LEGACY_EXPORT_MESSAGE,
  NEWER_VERSION_MESSAGE,
  NOT_EXPORT_MESSAGE,
  NOT_JSON_MESSAGE,
  UNKNOWN_FORM_TYPE_LABEL,
} from "./projectFile.constants";

// Volver a abrir un formulario exportado. El JSON que baja Exportar lleva, al lado del contrato
// que lee el consumidor, la copia del borrador (builderDraft), y el proyecto sale de ahi:
// formSchema se ignora, porque viene compilado y con perdidas, y el builder lo regenera.
//
// El archivo lo trae otra persona, asi que es entrada no confiable igual que localStorage: pasa
// por las mismas migraciones y el mismo esquema de Zod, que ademas sanea los enlaces del texto con
// formato. Lo que no se puede sanear son los scripts, que el simulador ejecuta tal como vienen.

export function readProjectFile(text: string): ProjectFileLoad {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: "error", message: NOT_JSON_MESSAGE };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { status: "error", message: NOT_EXPORT_MESSAGE };
  }

  const file: Record<string, unknown> = parsed as Record<string, unknown>;
  if (!("projectMeta" in file) || !("formSchema" in file)) {
    return { status: "error", message: NOT_EXPORT_MESSAGE };
  }

  // Un export sin copia es anterior a builderDraft. De lo compilado no se reconstruye el proyecto
  // sin perder las validaciones, asi que se pide volver a exportarlo en vez de abrirlo a medias.
  if (file.builderDraft === undefined) {
    return { status: "error", message: LEGACY_EXPORT_MESSAGE };
  }

  if (isNewerDraft(file.builderDraft)) {
    return { status: "error", message: NEWER_VERSION_MESSAGE };
  }

  const loaded: DraftLoad = parseDraft(file.builderDraft);
  if (loaded.status !== "ok") return { status: "error", message: DAMAGED_MESSAGE };

  return {
    status: "ok",
    // Todo lo que se exporta salio de un setup terminado. Un archivo que llegue con isComplete en
    // false dejaria la app en el asistente despues de abrirlo.
    draft: { ...loaded.draft, setupConfig: { ...loaded.draft.setupConfig, isComplete: true } },
    renamed: loaded.renamed,
  };
}

export function summarizeProjectFile(draft: DraftPayload): ProjectFileSummary {
  return {
    formTypeLabel:
      FORM_TYPES.find((option) => option.value === draft.setupConfig.formType)?.label ??
      UNKNOWN_FORM_TYPE_LABEL,
    stepCount: draft.formSteps.length,
    introStepCount: draft.introModal.steps.length,
    // Solo los pasos del formulario, igual que el resumen del panel derecho.
    fieldCount: draft.formSteps.reduce(
      (total, step) => total + step.rows.reduce((count, row) => count + row.fields.length, 0),
      0,
    ),
    savedAt: draft.savedAt,
  };
}
