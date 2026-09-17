import { useEffect, useState } from "react";
import { getBandElement, getFieldElement, getRowElement } from "../../lib/canvasDom/canvasDom";
import { downloadFormExport } from "../../lib/exportForm/exportForm";
import { diagnoseForm } from "../../lib/formDiagnostics/formDiagnostics";
import { useFormStore } from "../../store/formStore";
import type { FormProblem } from "../../types/formDiagnostics";
import type { PendingReveal, UseExportReviewResult } from "./useExportReview.types";

// Revision antes de exportar. Corre al darle Exportar y no mientras se edita, para no cobrarle
// nada al lienzo en cada tecla. Sin problemas descarga directo; con problemas deja la lista para el
// modal, donde los errores bloquean la descarga y los avisos no. La deteccion vive en
// lib/formDiagnostics; aca queda cuando correrla y a donde lleva cada problema.
export function useExportReview(): UseExportReviewResult {
  const setCanvasViewMode = useFormStore((state) => state.setCanvasViewMode);
  const setActiveCanvas = useFormStore((state) => state.setActiveCanvas);
  const selectFieldAndEdit = useFormStore((state) => state.selectFieldAndEdit);
  const selectField = useFormStore((state) => state.selectField);
  const setSidebarTab = useFormStore((state) => state.setSidebarTab);
  const setSidebarOpen = useFormStore((state) => state.setSidebarOpen);
  const [problems, setProblems] = useState<FormProblem[] | null>(null);
  // El nodo del campo recien existe despues del commit que cambia de paso: la vista se lleva hasta
  // ahi en un efecto, igual que la barra del lienzo con la fila que acaba de agregar.
  const [pendingReveal, setPendingReveal] = useState<PendingReveal | null>(null);

  useEffect(() => {
    if (!pendingReveal) return;

    let element: HTMLElement | null = getBandElement(pendingReveal.id);
    if (pendingReveal.kind === "field") element = getFieldElement(pendingReveal.id);
    if (pendingReveal.kind === "row") element = getRowElement(pendingReveal.id);

    element?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    setPendingReveal(null);
  }, [pendingReveal]);

  const hasErrors: boolean = problems?.some((problem) => problem.severity === "error") ?? false;

  function download(): void {
    const { formSteps, setupConfig, introModal, formScript } = useFormStore.getState();
    downloadFormExport(formSteps, setupConfig, introModal.steps, formScript);
  }

  function requestExport(): void {
    // Se lee con getState y no con selectores: la revision corre una vez por click, y suscribirse
    // haria que el panel se volviera a dibujar con cada cambio del formulario.
    const { formSteps, introModal, formScript } = useFormStore.getState();
    const found: FormProblem[] = diagnoseForm({
      formSteps,
      introSteps: introModal.steps,
      formScript,
    });

    if (found.length === 0) {
      download();
      return;
    }

    setProblems(found);
  }

  function exportAnyway(): void {
    if (hasErrors) return;

    download();
    setProblems(null);
  }

  function goTo(problem: FormProblem): void {
    setProblems(null);
    const { target } = problem;

    if (target.kind === "prelude") {
      selectField(null);
      setSidebarTab("logic");
      setSidebarOpen(true);
      return;
    }

    setCanvasViewMode("canvas");
    // setActiveCanvas vacia la seleccion, asi que va antes de seleccionar el campo.
    setActiveCanvas(target.canvas);

    if (target.kind === "field") {
      selectFieldAndEdit(target.fieldId, target.tab);
      setPendingReveal({ kind: "field", id: target.fieldId });
      return;
    }

    setPendingReveal(
      target.kind === "row"
        ? { kind: "row", id: target.rowId }
        : { kind: "band", id: target.groupId },
    );
  }

  return {
    problems,
    hasErrors,
    requestExport,
    exportAnyway,
    goTo,
    close: () => setProblems(null),
  };
}
