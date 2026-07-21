import JsonView from "@uiw/react-json-view";
import type { CSSProperties } from "react";
import { useState } from "react";
import { CheckCircle, Copy } from "reicon-react";
import { JSON_VIEW_DARK_THEME, JSON_VIEW_LIGHT_THEME } from "../../../constants/jsonViewTheme";
import {
  buildMappingTree,
  findOrphanBindings,
  toPlainSummary,
} from "../../../lib/payloadMapping/payloadMapping";
import type { MappingNode, OrphanBinding } from "../../../lib/payloadMapping/payloadMapping.types";
import { PAYLOAD_SCHEMA } from "../../../lib/payloadSchema/payloadSchema.constants";
import { getAllFields, useFormStore } from "../../../store/formStore";
import type { CanvasField, CanvasRow } from "../../../types/storeTypes";
import { colorClassForSummaryValue } from "./PayloadPreviewCanvas.utils";

export function PayloadPreviewCanvas() {
  const formSteps = useFormStore((state) => state.formSteps);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const isDarkMode = useFormStore((state) => state.isDarkMode);
  const [copied, setCopied] = useState<boolean>(false);

  const allRows: CanvasRow[] = [
    ...formSteps.flatMap((step) => step.rows),
    ...introSteps.flatMap((step) => step.rows),
  ];
  const allFields: CanvasField[] = getAllFields(allRows);
  const mappingTree: MappingNode = buildMappingTree(PAYLOAD_SCHEMA, allFields);
  const orphanBindings: OrphanBinding[] = findOrphanBindings(PAYLOAD_SCHEMA, allFields);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(JSON.stringify(toPlainSummary(mappingTree), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-neutral-500">
          Se actualiza en vivo con cada cambio del mapeo de campos.
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:cursor-pointer hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {copied ? (
            <>
              <CheckCircle size={12} weight="Filled" className="text-emerald-500" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={12} />
              Copiar
            </>
          )}
        </button>
      </div>

      {orphanBindings.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          <p className="font-semibold">
            Rutas huérfanas — el campo apunta a algo que ya no existe:
          </p>
          <ul className="mt-1 list-disc pl-4">
            {orphanBindings.map((orphan) => (
              <li key={orphan.fieldId}>
                {orphan.fieldLabel} → {orphan.path}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 overflow-auto rounded-md bg-slate-100 p-2 text-xs leading-relaxed dark:bg-neutral-900">
        <JsonView
          value={toPlainSummary(mappingTree) as object}
          style={(isDarkMode ? JSON_VIEW_DARK_THEME : JSON_VIEW_LIGHT_THEME) as CSSProperties}
          displayDataTypes={false}
          enableClipboard={false}
        >
          <JsonView.String
            render={(props, result) => {
              if (result.type !== "value") return <span {...props} />;
              const colorClass = colorClassForSummaryValue(String(result.value ?? ""));
              return (
                <span {...props} className={`${props.className ?? ""} ${colorClass}`.trim()} />
              );
            }}
          />
        </JsonView>
      </div>
    </div>
  );
}
