import { useMemo, useState } from "react";
import { CheckCircle, Copy } from "reicon-react";
import { buildFormExport } from "../../../lib/exportForm/exportForm";
import { useFormStore } from "../../../store/formStore";
import { JsonCode } from "../../molecules/JsonCode/JsonCode";

export function JsonPreviewCanvas() {
  const formSteps = useFormStore((state) => state.formSteps);
  const setupConfig = useFormStore((state) => state.setupConfig);
  const introSteps = useFormStore((state) => state.introModal.steps);
  const [copied, setCopied] = useState<boolean>(false);

  const json: string = useMemo(
    () => JSON.stringify(buildFormExport(formSteps, setupConfig, introSteps), null, 2),
    [formSteps, setupConfig, introSteps],
  );

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-neutral-500">
          Se actualiza en vivo con cada cambio del formulario.
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

      <JsonCode json={json} className="flex-1 rounded-md bg-slate-100 p-3 dark:bg-neutral-950" />
    </div>
  );
}
