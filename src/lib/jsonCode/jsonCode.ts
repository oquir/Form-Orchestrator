import type { JsonLine, JsonModel, JsonSegment, JsonVisibleRow } from "../../types/jsonCode";

// Resaltado y plegado del JSON que se muestra en el lienzo. Es un tokenizador propio y no una
// libreria porque solo hay que distinguir cuatro cosas sobre un JSON que ya se sabe bien formado.

// La clave se reconoce por los dos puntos que la siguen, que es lo que la separa de un texto.
const TOKEN_RE: RegExp =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;

export function tokenizeJson(json: string): JsonSegment[] {
  const segments: JsonSegment[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;

  let match: RegExpExecArray | null = TOKEN_RE.exec(json);
  while (match !== null) {
    if (match.index > last) segments.push(json.slice(last, match.index));

    const [full, quoted, colon, num, keyword] = match;
    const offset: number = match.index;

    if (quoted !== undefined) {
      if (colon !== undefined) {
        segments.push({ text: quoted, kind: "key", offset });
        segments.push(colon);
      } else {
        segments.push({ text: quoted, kind: "string", offset });
      }
    } else if (num !== undefined) {
      segments.push({ text: num, kind: "number", offset });
    } else if (keyword !== undefined) {
      segments.push({ text: keyword, kind: keyword === "null" ? "null" : "boolean", offset });
    }

    last = match.index + full.length;
    match = TOKEN_RE.exec(json);
  }

  if (last < json.length) segments.push(json.slice(last));

  return segments;
}

export function parseJsonLines(json: string): JsonLine[] {
  const raw: string[] = json.split("\n");
  const lines: JsonLine[] = [];
  const stack: number[] = [];
  let offset = 0;

  for (let i = 0; i < raw.length; i++) {
    const text: string = raw[i];
    const line: JsonLine = {
      text,
      offset,
      opensContainer: false,
      openChar: null,
      closeIndex: -1,
      trailingComma: false,
    };
    lines.push(line);
    offset += text.length + 1;

    const trimmed: string = text.trim();
    const first: string = trimmed.charAt(0);
    if (first === "}" || first === "]") {
      const opener: number | undefined = stack.pop();
      if (opener !== undefined) {
        lines[opener].closeIndex = i;
        lines[opener].trailingComma = trimmed.endsWith(",");
      }
    }

    const lastChar: string = trimmed.charAt(trimmed.length - 1);
    if (lastChar === "{" || lastChar === "[") {
      line.opensContainer = true;
      line.openChar = lastChar;
      stack.push(i);
    }
  }

  return lines;
}

export function buildJsonModel(json: string): JsonModel {
  const lines: JsonLine[] = parseJsonLines(json);
  const rows = lines.map((line) => {
    const indent: string = line.text.slice(0, line.text.length - line.text.trimStart().length);
    return { indent, tokens: tokenizeJson(line.text.slice(indent.length)) };
  });

  return { lines, rows };
}

export function computeVisibleRows(model: JsonModel, collapsed: Set<number>): JsonVisibleRow[] {
  const visible: JsonVisibleRow[] = [];
  let i = 0;

  while (i < model.lines.length) {
    const line: JsonLine = model.lines[i];
    const { indent, tokens } = model.rows[i];
    const isCollapsed: boolean = line.opensContainer && collapsed.has(i);

    visible.push({
      lineIndex: i,
      key: line.offset,
      indent,
      tokens,
      opensContainer: line.opensContainer,
      isCollapsed,
      closeChar: isCollapsed ? (line.openChar === "{" ? "}" : "]") : "",
      trailingComma: line.trailingComma,
    });

    i = isCollapsed ? line.closeIndex + 1 : i + 1;
  }

  return visible;
}
