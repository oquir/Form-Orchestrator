import { CheckCircle, Copy } from "reicon-react";
import { usePayloadPreviewCanvas } from "../../../hooks/usePayloadPreviewCanvas/usePayloadPreviewCanvas";
import { JsonCode } from "../../molecules/JsonCode/JsonCode";
import { colorClassForSummaryValue } from "./PayloadPreviewCanvas.utils";

export function PayloadPreviewCanvas() {
  const { summaryJson, orphanBindings, copied, handleCopy } = usePayloadPreviewCanvas();

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

      <JsonCode
        json={summaryJson}
        valueClassName={colorClassForSummaryValue}
        className="flex-1 rounded-md bg-slate-100 p-3 dark:bg-neutral-950"
      />
    </div>
  );
}
