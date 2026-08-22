import type { DragEndEvent, DragMoveEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import { findNearestFit, getFreeRuns } from "../../lib/rowLayout/rowLayout";
import { resolveBandDrop, resolveRowDrop } from "../../lib/rowOrder/rowOrder";
import { findRowById, getActiveRows, useFormStore } from "../../store/formStore";
import type { ActiveDrag } from "../../types/activeDrag";
import type { DragAndDropReturn } from "../../types/dragAndDropReturn";
import type { CanvasField } from "../../types/field";
import type { FieldTypeDef } from "../../types/fieldTypes";
import type { CanvasRow } from "../../types/formStructure";
import type { CanvasTarget, DragPlacement, RowDropTarget } from "../../types/placement";
import { DRAG_ACTIVATION_DISTANCE_PX } from "./useDragAndDrop.constants";
import type { PointerPosition } from "./useDragAndDrop.types";
import {
  centerOverlayOnCursor,
  getBandElement,
  getColumnAtPointer,
  getDropEdgeAtPointer,
  getRowElement,
  measureRow,
  pointerFirstCollision,
  sameCanvasTarget,
  samePlacement,
  sameRowDropTarget,
} from "./useDragAndDrop.utils";

const OVERLAY_MODIFIERS: Modifier[] = [centerOverlayOnCursor];
// La fila no se centra en el cursor: se dibuja del tamano real y conserva el punto por donde se
// agarro, que es lo que hace que parezca que uno lleva la seccion en la mano y no una ficha.
const ROW_OVERLAY_MODIFIERS: Modifier[] = [];

// Todo el cableado de arrastrar y soltar: de la paleta a una fila, del almacen a una fila, de una
// fila a otra y la fila entera cambiando de sitio. App solo monta el DndContext y el DragOverlay.
// Con Shift se resaltan las columnas de la fila para elegir donde empieza el campo; con Shift+Ctrl
// la columna donde se pulso Ctrl queda anclada y el puntero define el final, asi que el arrastre
// tambien redimensiona. Los modificadores se leen en vivo durante el arrastre.
export function useDragAndDrop(): DragAndDropReturn {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const moveField = useFormStore((state) => state.moveField);
  const moveRow = useFormStore((state) => state.moveRow);
  const moveFieldToStep = useFormStore((state) => state.moveFieldToStep);
  const moveRowToStep = useFormStore((state) => state.moveRowToStep);
  const setDragPlacement = useFormStore((state) => state.setDragPlacement);
  const setRowDropTarget = useFormStore((state) => state.setRowDropTarget);
  const setRowDrag = useFormStore((state) => state.setRowDrag);
  const setDraggingFieldId = useFormStore((state) => state.setDraggingFieldId);
  const setHoveredTransferTarget = useFormStore((state) => state.setHoveredTransferTarget);
  const hoveredTransferTarget = useFormStore((state) => state.hoveredTransferTarget);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  // Todo esto va en refs y no en estado: se actualiza en cada movimiento del puntero y en cada
  // tecla, y volver a renderizar a ese ritmo haria el arrastre a tirones.
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const hoveredRowIdRef = useRef<string | null>(null);
  const hoveredBandIdRef = useRef<string | null>(null);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const modifiersRef = useRef({ shift: false, ctrl: false });
  const anchorRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
  );

  const getDraggedSpan = useCallback((drag: ActiveDrag | null): number => {
    if (!drag) return GRID_BASE_COLUMNS;
    if (drag.source === "canvas-field") return drag.field.colSpan;
    return GRID_BASE_COLUMNS;
  }, []);

  // recomputePlacement corre en cada pointermove, o sea unas cien veces por segundo, y casi
  // siempre para dejar todo igual. Escribir al store igual crea un estado nuevo y obliga a cada
  // suscriptor a reevaluar su selector, asi que solo se escribe cuando el valor cambia de verdad.
  const applyPlacement = useCallback(
    (next: DragPlacement | null): void => {
      if (samePlacement(useFormStore.getState().dragPlacement, next)) return;
      setDragPlacement(next);
    },
    [setDragPlacement],
  );

  const recomputePlacement = useCallback((): void => {
    const drag = activeDragRef.current;
    const rowId = hoveredRowIdRef.current;
    const { shift, ctrl } = modifiersRef.current;

    if (!drag || !rowId || !shift) {
      applyPlacement(null);
      return;
    }

    const row = findRowById(useFormStore.getState(), rowId);
    const rowElement = getRowElement(rowId);
    if (!row || !rowElement) {
      applyPlacement(null);
      return;
    }

    const column = getColumnAtPointer(rowElement, row.columns, pointerRef.current.x);
    const excludeId = drag.source === "canvas-field" ? drag.field.id : undefined;
    const runs = getFreeRuns(row.fields, row.columns, excludeId);

    if (ctrl) {
      if (anchorRef.current === null) anchorRef.current = column;
      const anchor = anchorRef.current;
      const run = runs.find((r) => anchor >= r.start && anchor < r.start + r.length);

      if (!run) {
        applyPlacement({ rowId, colStart: anchor, colSpan: 1, mode: "resize", isValid: false });
        return;
      }

      const maxSpan = run.start + run.length - anchor;
      const colSpan = Math.max(1, Math.min(column - anchor + 1, maxSpan));
      applyPlacement({ rowId, colStart: anchor, colSpan, mode: "resize", isValid: true });
      return;
    }

    anchorRef.current = null;
    const colSpan = Math.max(1, Math.min(getDraggedSpan(drag), row.columns));
    const snapped = findNearestFit(runs, column, colSpan);

    applyPlacement({
      rowId,
      colStart: snapped ?? column,
      colSpan,
      mode: "move",
      isValid: snapped !== null,
    });
  }, [getDraggedSpan, applyPlacement]);

  const applyRowDropTarget = useCallback(
    (next: RowDropTarget | null): void => {
      if (sameRowDropTarget(useFormStore.getState().rowDropTarget, next)) return;
      setRowDropTarget(next);
    },
    [setRowDropTarget],
  );

  const recomputeRowDrop = useCallback(
    (draggedRow: CanvasRow): void => {
      const rows: CanvasRow[] = getActiveRows(useFormStore.getState());
      const hoveredRowId: string | null = hoveredRowIdRef.current;
      const hoveredBandId: string | null = hoveredBandIdRef.current;
      const pointerY: number = pointerRef.current.y;

      // Los dos salen del mismo `over`, asi que nunca hay ambos a la vez. La fila se mira primero
      // porque la banda solo gana donde no hay ninguna: su cabecera y su relleno.
      if (hoveredRowId) {
        const element: HTMLElement | null = getRowElement(hoveredRowId);
        const edge = element ? getDropEdgeAtPointer(element, pointerY) : null;

        applyRowDropTarget(edge && resolveRowDrop(rows, draggedRow.id, hoveredRowId, edge));
        return;
      }

      if (hoveredBandId) {
        const element: HTMLElement | null = getBandElement(hoveredBandId);
        const edge = element ? getDropEdgeAtPointer(element, pointerY) : null;

        applyRowDropTarget(edge && resolveBandDrop(rows, draggedRow.id, hoveredBandId, edge));
        return;
      }

      applyRowDropTarget(null);
    },
    [applyRowDropTarget],
  );

  const recompute = useCallback((): void => {
    const drag = activeDragRef.current;

    // Arrastrar una fila no coloca nada en columnas. Sin este corte, mantener Shift durante el
    // arrastre calcularia una colocacion de campo fantasma sobre la fila que hay debajo.
    if (drag?.source === "canvas-row") {
      applyPlacement(null);
      recomputeRowDrop(drag.row);
      return;
    }

    applyRowDropTarget(null);
    recomputePlacement();
  }, [applyPlacement, applyRowDropTarget, recomputePlacement, recomputeRowDrop]);

  useEffect(() => {
    if (!activeDrag) return;

    function handlePointerMove(event: PointerEvent): void {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      modifiersRef.current = { shift: event.shiftKey, ctrl: event.ctrlKey || event.metaKey };
      if (!modifiersRef.current.ctrl) anchorRef.current = null;
      recompute();
    }

    function handleKeyChange(event: KeyboardEvent): void {
      const ctrl = event.ctrlKey || event.metaKey;
      if (!ctrl) anchorRef.current = null;
      modifiersRef.current = { shift: event.shiftKey, ctrl };
      recompute();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyChange);
    window.addEventListener("keyup", handleKeyChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyChange);
      window.removeEventListener("keyup", handleKeyChange);
    };
  }, [activeDrag, recompute]);

  function resetDragState(): void {
    setActiveDrag(null);
    activeDragRef.current = null;
    hoveredRowIdRef.current = null;
    hoveredBandIdRef.current = null;
    anchorRef.current = null;
    modifiersRef.current = { shift: false, ctrl: false };
    setDragPlacement(null);
    setRowDropTarget(null);
    setRowDrag(null);
    setDraggingFieldId(null);
    setHoveredTransferTarget(null);
  }

  function handleDragStart(event: DragStartEvent): void {
    const data = event.active.data.current;
    let drag: ActiveDrag | null = null;

    if (data?.source === "palette") {
      drag = { source: "palette", fieldType: data.fieldType as FieldTypeDef };
    } else if (data?.source === "canvas-field") {
      drag = { source: "canvas-field", field: data.field as CanvasField };
    } else if (data?.source === "canvas-row") {
      drag = { source: "canvas-row", row: data.row as CanvasRow };
    }

    setActiveDrag(drag);
    activeDragRef.current = drag;
    anchorRef.current = null;
    // Al store y no a una ref porque lo leen tres componentes: la banda para encender su zona de
    // soltar, la grilla para apartar las filas y la previsualizacion para dibujarse del mismo
    // tamano. Son dos escrituras por arrastre, no cien por segundo.
    setRowDrag(drag?.source === "canvas-row" ? measureRow(drag.row.id) : null);
    // Lo leen las pestanas de paso para encenderse como destino de mudanza, igual que rowDrag.
    setDraggingFieldId(drag?.source === "canvas-field" ? drag.field.id : null);
  }

  function handleDragMove(event: DragMoveEvent): void {
    const overData = event.over?.data.current as
      | { rowId?: string; bandGroupId?: string; canvasTarget?: CanvasTarget }
      | undefined;
    hoveredRowIdRef.current = overData?.rowId ?? null;
    hoveredBandIdRef.current = overData?.bandGroupId ?? null;

    // Al store porque lo mira la previsualizacion, y solo cuando cambia de verdad: esto corre en
    // cada movimiento del puntero igual que el resto.
    const nextTarget: CanvasTarget | null = overData?.canvasTarget ?? null;
    if (!sameCanvasTarget(useFormStore.getState().hoveredTransferTarget, nextTarget)) {
      setHoveredTransferTarget(nextTarget);
    }

    recompute();
  }

  function handleDragEnd(event: DragEndEvent): void {
    const placement = useFormStore.getState().dragPlacement;
    const rowDropTarget = useFormStore.getState().rowDropTarget;
    const requested = placement?.isValid
      ? { colStart: placement.colStart, colSpan: placement.colSpan }
      : undefined;

    const { active, over } = event;
    const data = active.data.current;
    resetDragState();

    const overData = over?.data.current as
      | { rowId?: string; canvasTarget?: CanvasTarget }
      | undefined;

    // Soltar sobre una pestana se resuelve antes que nada: el destino es otro lienzo, asi que ni la
    // colocacion en columnas ni el reordenamiento de filas tienen nada que decir.
    if (overData?.canvasTarget) {
      if (data?.source === "canvas-field") {
        moveFieldToStep((data.field as CanvasField).id, overData.canvasTarget);
      } else if (data?.source === "canvas-row") {
        moveRowToStep((data.row as CanvasRow).id, overData.canvasTarget);
      }
      return;
    }

    // La fila no se guia por `over` sino por el destino ya resuelto: el iman puede haberla llevado
    // al borde de una banda, que es otra fila distinta de la que hay bajo el cursor.
    if (data?.source === "canvas-row") {
      if (rowDropTarget?.isValid) moveRow((data.row as CanvasRow).id, rowDropTarget);
      return;
    }

    if (!over) return;

    const targetRowId = overData?.rowId;
    if (!targetRowId) return;

    if (data?.source === "palette") {
      addFieldToRow(targetRowId, data.fieldType as FieldTypeDef, requested);
    } else if (data?.source === "canvas-field") {
      const field = data.field as CanvasField;
      moveField(field.id, targetRowId, requested);
    }
  }

  return {
    sensors,
    activeDrag,
    collisionDetection: pointerFirstCollision,
    // Sobre una pestana la previsualizacion se encoge a una ficha, y una ficha si se centra en el
    // cursor: asi queda pegada al puntero en vez de flotando donde estaba el borde de la fila.
    overlayModifiers:
      activeDrag?.source === "canvas-row" && !hoveredTransferTarget
        ? ROW_OVERLAY_MODIFIERS
        : OVERLAY_MODIFIERS,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
