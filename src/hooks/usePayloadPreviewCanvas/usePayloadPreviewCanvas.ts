import { useEffect, useMemo, useRef, useState } from "react";
import { PAYLOAD_SCHEMA } from "../../constants/payloadSchema";
import { isPresentationalField } from "../../lib/fieldKind/fieldKind";
import {
  buildMappingTree,
  findOrphanBindings,
  toPlainSummary,
} from "../../lib/payloadMapping/payloadMapping";
import { getAllFields, useFormStore } from "../../store/formStore";
import type { CanvasField } from "../../types/field";
import type { CanvasRow } from "../../types/formStructure";
import type { MappingNode, OrphanBinding } from "../../types/payloadMapping";
import type { UsePayloadPreviewCanvasResult } from "./usePayloadPreviewCanvas.types";

export function usePayloadPreviewCanvas(): UsePayloadPreviewCanvasResult {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const [copied, setCopied] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const { summaryJson, orphanBindings } = useMemo(() => {
    const allRows: CanvasRow[] = [
      ...formSteps.flatMap((step) => step.rows),
      ...introSteps.flatMap((step) => step.rows),
    ];
    const allFields: CanvasField[] = getAllFields(allRows).filter(
      (field) => !isPresentationalField(field.type),
    );
    const mappingTree: MappingNode = buildMappingTree(PAYLOAD_SCHEMA, allFields);
    const orphans: OrphanBinding[] = findOrphanBindings(PAYLOAD_SCHEMA, allFields);

    return {
      summaryJson: JSON.stringify(toPlainSummary(mappingTree), null, 2),
      orphanBindings: orphans,
    };
  }, [formSteps, introSteps]);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(summaryJson);
    setCopied(true);

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return {
    summaryJson,
    orphanBindings,
    copied,
    handleCopy,
  };
}
