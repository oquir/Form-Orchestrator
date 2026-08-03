import { useMemo, useState } from "react";
import { mappedFieldCount } from "../../../../lib/runtimePayload/runtimePayload";
import type { RuntimeIssue } from "../../../../types/formRuntime";
import { JsonCode } from "../../../molecules/JsonCode/JsonCode";
import { TabButtonGroup } from "../../../molecules/TabButtonGroup/TabButtonGroup";
import { RESULT_TABS, type ResultTab } from "./PreviewResults.constants";
import type { PreviewResultsProps } from "./PreviewResults.types";

export function PreviewResults({ preview }: PreviewResultsProps) {
  const [tab, setTab] = useState<ResultTab>("payload");
  const errorEntries: [string, string][] = Object.entries(preview.errors);
  const issues: RuntimeIssue[] = preview.issues;

  const payloadJson: string = useMemo(
    () => JSON.stringify(preview.payload, null, 2),
    [preview.payload],
  );
  const valuesJson: string = useMemo(
    () => JSON.stringify({ campos: preview.state.values, grupos: preview.state.groups }, null, 2),
    [preview.state],
  );

  return (
    <aside className="flex h-full min-h-0 flex-col gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <TabButtonGroup tabs={RESULT_TABS} activeTab={tab} onSelect={setTab} />
        <span className="text-[11px] text-fg-subtle">
          {mappedFieldCount(preview.model)} mapeados
        </span>
      </div>

      {issues.length > 0 && (
        <ul className="flex shrink-0 list-none flex-col gap-1 rounded-md border border-warning-border bg-warning-surface p-2">
          {issues.map((issue) => (
            <li key={`${issue.kind}-${issue.field ?? ""}`} className="text-[11px] text-warning">
              {issue.field ? `${issue.field}: ` : ""}
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      <div className="min-h-64 flex-1 overflow-hidden lg:min-h-0">
        {tab === "payload" && <JsonCode json={payloadJson} className="h-full" />}
        {tab === "values" && <JsonCode json={valuesJson} className="h-full" />}
        {tab === "errors" &&
          (errorEntries.length === 0 ? (
            <p className="text-xs text-fg-subtle">Sin errores de validación.</p>
          ) : (
            <ul className="flex h-full list-none flex-col gap-1.5 overflow-auto">
              {errorEntries.map(([key, message]) => (
                <li key={key} className="text-[11px]">
                  <span className="font-medium text-fg-soft">{key}</span>
                  <span className="text-danger"> — {message}</span>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </aside>
  );
}
