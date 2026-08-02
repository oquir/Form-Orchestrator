import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "reicon-react";
import { useJsonCode } from "../../../hooks/useJsonCode/useJsonCode";
import type { JsonCodeProps, JsonSegment } from "../../../types/jsonCode";
import { JSON_CODE_BASE_CLASSES, JSON_MUTED_CLASS } from "./JsonCode.constants";
import { segmentClass } from "./JsonCode.utils";

export function JsonCode({ json, valueClassName, className }: JsonCodeProps) {
  const { rows, toggle } = useJsonCode(json);

  const renderTokens = (tokens: JsonSegment[]): ReactNode[] =>
    tokens.map((segment) =>
      typeof segment === "string" ? (
        segment
      ) : (
        <span key={segment.offset} className={segmentClass(segment, valueClassName)}>
          {segment.text}
        </span>
      ),
    );

  return (
    <div className={`${JSON_CODE_BASE_CLASSES} ${className ?? ""}`.trim()}>
      {rows.map((row) => {
        const content: ReactNode[] = renderTokens(row.tokens);

        if (row.isCollapsed) {
          content.push(
            <span key="fold" className={JSON_MUTED_CLASS}>
              {` … ${row.closeChar}${row.trailingComma ? "," : ""}`}
            </span>,
          );
        }

        return (
          <div key={row.key} className="flex w-max min-w-full">
            <span className="shrink-0 whitespace-pre">{row.indent}</span>
            {row.opensContainer ? (
              <button
                type="button"
                onClick={() => toggle(row.lineIndex)}
                className="flex w-4 shrink-0 cursor-pointer items-center justify-center text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
              >
                {row.isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <span className="shrink-0 whitespace-pre">{content}</span>
          </div>
        );
      })}
    </div>
  );
}
