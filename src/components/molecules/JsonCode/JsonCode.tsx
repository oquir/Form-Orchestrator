import { type ReactNode, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "reicon-react";
import { JSON_CODE_BASE_CLASSES, JSON_MUTED_CLASS, JSON_TOKEN_CLASSES } from "./JsonCode.constants";
import type { JsonCodeProps, JsonLine, JsonSegment } from "./JsonCode.types";
import { parseJsonLines, tokenizeJson } from "./JsonCode.utils";

function decodeString(quoted: string): string {
  try {
    return JSON.parse(quoted) as string;
  } catch {
    return quoted;
  }
}

function segmentClass(
  segment: Exclude<JsonSegment, string>,
  valueClassName?: (rawValue: string) => string | undefined,
): string {
  if (segment.kind === "string" && valueClassName) {
    const custom: string | undefined = valueClassName(decodeString(segment.text));
    if (custom && custom.length > 0) return custom;
  }

  return JSON_TOKEN_CLASSES[segment.kind];
}

export function JsonCode({ json, valueClassName, className }: JsonCodeProps) {
  const model = useMemo(() => {
    const lines: JsonLine[] = parseJsonLines(json);
    const rows = lines.map((line) => {
      const indent: string = line.text.slice(0, line.text.length - line.text.trimStart().length);
      return { indent, tokens: tokenizeJson(line.text.slice(indent.length)) };
    });

    return { lines, rows };
  }, [json]);

  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());

  const toggle = (index: number): void =>
    setCollapsed((prev) => {
      const next: Set<number> = new Set(prev);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });

  const renderSegments = (segments: JsonSegment[]): ReactNode[] =>
    segments.map((segment) =>
      typeof segment === "string" ? (
        segment
      ) : (
        <span key={segment.offset} className={segmentClass(segment, valueClassName)}>
          {segment.text}
        </span>
      ),
    );

  const rendered: ReactNode[] = [];
  let i = 0;
  while (i < model.lines.length) {
    const index: number = i;
    const line: JsonLine = model.lines[index];
    const { indent, tokens } = model.rows[index];
    const isCollapsed: boolean = line.opensContainer && collapsed.has(index);
    const content: ReactNode[] = renderSegments(tokens);

    if (isCollapsed) {
      const closeChar: string = line.openChar === "{" ? "}" : "]";
      content.push(
        <span key="fold" className={JSON_MUTED_CLASS}>
          {` … ${closeChar}${line.trailingComma ? "," : ""}`}
        </span>,
      );
    }

    rendered.push(
      <div key={line.offset} className="flex w-max min-w-full">
        <span className="shrink-0 whitespace-pre">{indent}</span>
        {line.opensContainer ? (
          <button
            type="button"
            onClick={() => toggle(index)}
            className="flex w-4 shrink-0 cursor-pointer items-center justify-center text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
          >
            {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="shrink-0 whitespace-pre">{content}</span>
      </div>,
    );

    i = isCollapsed ? line.closeIndex + 1 : index + 1;
  }

  return <div className={`${JSON_CODE_BASE_CLASSES} ${className ?? ""}`.trim()}>{rendered}</div>;
}
