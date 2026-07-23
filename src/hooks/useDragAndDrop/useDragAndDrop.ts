import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { GRID_BASE_COLUMNS } from "../../constants/grid";
import { findNearestFit, getFreeRuns } from "../../lib/rowLayout/rowLayout";
import { findRowById, useFormStore } from "../../store/formStore";
import type { ActiveDrag } from "../../types/activeDrag";
import type { FieldTypeDef } from "../../types/fieldTypes";
import type { CanvasField, SavedComponent } from "../../types/storeTypes";
import { DRAG_ACTIVATION_DISTANCE_PX, OPTIONS_GROUP_FIELD_TYPES } from "./useDragAndDrop.constants";
import type { PendingOptionsField, PointerPosition } from "./useDragAndDrop.types";
import { getColumnAtPointer, getRowElement } from "./useDragAndDrop.utils";

export function useDragAndDrop() {
  const addFieldToRow = useFormStore((state) => state.addFieldToRow);
  const addSavedComponentToRow = useFormStore((state) => state.addSavedComponentToRow);
  const moveField = useFormStore((state) => state.moveField);
  const setDragPlacement = useFormStore((state) => state.setDragPlacement);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingOptionsField, setPendingOptionsField] = useState<PendingOptionsField | null>(null);

  const activeDragRef = useRef<ActiveDrag | null>(null);
  const hoveredRowIdRef = useRef<string | null>(null);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const modifiersRef = useRef({ shift: false, ctrl: false });
  const anchorRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
  );

  const getDraggedSpan = useCallback((drag: ActiveDrag | null): number => {
    if (!drag) return GRID_BASE_COLUMNS;
    if (drag.source === "canvas-field") return drag.field.colSpan;
    if (drag.source === "library") return drag.component.colSpan;
    return GRID_BASE_COLUMNS;
  }, []);

  const recomputePlacement = useCallback((): void => {
    const drag = activeDragRef.current;
    const rowId = hoveredRowIdRef.current;
    const { shift, ctrl } = modifiersRef.current;

    if (!drag || !rowId || !shift) {
      setDragPlacement(null);
      return;
    }

    const row = findRowById(useFormStore.getState(), rowId);
    const rowElement = getRowElement(rowId);
    if (!row || !rowElement) {
      setDragPlacement(null);
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
        setDragPlacement({ rowId, colStart: anchor, colSpan: 1, mode: "resize", isValid: false });
        return;
      }
      const maxSpan = run.start + run.length - anchor;
      const colSpan = Math.max(1, Math.min(column - anchor + 1, maxSpan));
      setDragPlacement({ rowId, colStart: anchor, colSpan, mode: "resize", isValid: true });
      return;
    }

    anchorRef.current = null;
    const colSpan = Math.max(1, Math.min(getDraggedSpan(drag), row.columns));
    const snapped = findNearestFit(runs, column, colSpan);
    setDragPlacement({
      rowId,
      colStart: snapped ?? column,
      colSpan,
      mode: "move",
      isValid: snapped !== null,
    });
  }, [getDraggedSpan, setDragPlacement]);

  useEffect(() => {
    if (!activeDrag) return;

    function handlePointerMove(event: PointerEvent): void {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      modifiersRef.current = { shift: event.shiftKey, ctrl: event.ctrlKey || event.metaKey };
      if (!modifiersRef.current.ctrl) anchorRef.current = null;
      recomputePlacement();
    }

    function handleKeyChange(event: KeyboardEvent): void {
      const ctrl = event.ctrlKey || event.metaKey;
      if (!ctrl) anchorRef.current = null;
      modifiersRef.current = { shift: event.shiftKey, ctrl };
      recomputePlacement();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyChange);
    window.addEventListener("keyup", handleKeyChange);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyChange);
      window.removeEventListener("keyup", handleKeyChange);
    };
  }, [activeDrag, recomputePlacement]);

  function resetDragState(): void {
    setActiveDrag(null);
    activeDragRef.current = null;
    hoveredRowIdRef.current = null;
    anchorRef.current = null;
    modifiersRef.current = { shift: false, ctrl: false };
    setDragPlacement(null);
  }

  function handleDragStart(event: DragStartEvent): void {
    const data = event.active.data.current;
    let drag: ActiveDrag | null = null;
    if (data?.source === "palette") {
      drag = { source: "palette", fieldType: data.fieldType as FieldTypeDef };
    } else if (data?.source === "library") {
      drag = { source: "library", component: data.component as SavedComponent };
    } else if (data?.source === "canvas-field") {
      drag = { source: "canvas-field", field: data.field as CanvasField };
    }
    setActiveDrag(drag);
    activeDragRef.current = drag;
    anchorRef.current = null;
  }

  function handleDragMove(event: DragMoveEvent): void {
    const overData = event.over?.data.current as { rowId?: string } | undefined;
    hoveredRowIdRef.current = overData?.rowId ?? null;
    recomputePlacement();
  }

  function handleDragEnd(event: DragEndEvent): void {
    const placement = useFormStore.getState().dragPlacement;
    const requested = placement?.isValid
      ? { colStart: placement.colStart, colSpan: placement.colSpan }
      : undefined;

    const { active, over } = event;
    const data = active.data.current;
    resetDragState();
    if (!over) return;

    const overData = over.data.current as { rowId?: string } | undefined;
    const targetRowId = overData?.rowId;
    if (!targetRowId) return;

    if (data?.source === "palette") {
      const fieldType = data.fieldType as FieldTypeDef;
      if (OPTIONS_GROUP_FIELD_TYPES.includes(fieldType.type)) {
        setPendingOptionsField({ rowId: targetRowId, fieldType, placement: requested });
      } else {
        addFieldToRow(targetRowId, fieldType, undefined, requested);
      }
    } else if (data?.source === "library") {
      const component = data.component as SavedComponent;
      addSavedComponentToRow(targetRowId, component.id, requested);
    } else if (data?.source === "canvas-field") {
      const field = data.field as CanvasField;
      moveField(field.id, targetRowId, requested);
    }
  }

  function confirmOptionsField(config: { title?: string; optionCount: number }): void {
    if (!pendingOptionsField) return;
    addFieldToRow(
      pendingOptionsField.rowId,
      pendingOptionsField.fieldType,
      config,
      pendingOptionsField.placement,
    );
    setPendingOptionsField(null);
  }

  function cancelOptionsField(): void {
    setPendingOptionsField(null);
  }

  return {
    sensors,
    activeDrag,
    pendingOptionsField,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    confirmOptionsField,
    cancelOptionsField,
  };
}
