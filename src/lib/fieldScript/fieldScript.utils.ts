import { SCRIPT_VALUES_PARAM } from "../../constants/fieldScript";
import type { ScriptRef } from "../../types/fieldScript";
import { REF_PATTERN } from "./fieldScript.constants";
import type { ScanFrame, ScanResult } from "./fieldScript.types";

// Recorrido de la fuente distinguiendo codigo de texto. Existe porque sustituir a ciegas con una
// expresion regular falla en dos casos silenciosos: un {campo} dentro de un string rompe el JS al
// sustituirlo -- "falta {x}" quedaria como "falta __v["x"]" -- y uno dentro de un comentario
// inventa una dependencia que el script no lee, que en el grafo es una arista falsa capaz de
// cerrar un ciclo inexistente.
//
// Limite conocido: no se detectan las expresiones regulares literales. Separar /foo/ de una
// division obliga a seguir el contexto de la expresion entera, y para que esto rompa hace falta
// que un campo se llame igual que un cuantificador: /a{n}/ con un campo llamado n.

// Devuelve la posicion siguiente al string, o el salto de linea si quedo sin cerrar. Cortar en el
// salto es lo que evita que una comilla suelta se trague el resto del script y apague las
// referencias de mas abajo; el error de sintaxis lo reporta despues new Function.
function skipQuoted(source: string, start: number, quote: string): number {
  let i: number = start + 1;

  while (i < source.length) {
    const char: string = source[i];

    if (char === "\\") {
      i += 2;
      continue;
    }

    if (char === quote) return i + 1;
    if (char === "\n") return i;

    i += 1;
  }

  return source.length;
}

export function scanScript(source: string, knownNames: Set<string>): ScanResult {
  const refs: ScriptRef[] = [];
  const pieces: string[] = [];
  const stack: ScanFrame[] = [{ kind: "code", depth: 0 }];
  let copied = 0;
  let i = 0;

  while (i < source.length) {
    const frame: ScanFrame = stack[stack.length - 1];
    const char: string = source[i];

    if (frame.kind === "template") {
      if (char === "\\") {
        i += 2;
        continue;
      }

      if (char === "`") {
        stack.pop();
        i += 1;
        continue;
      }

      // Dentro de ${...} se vuelve a codigo, asi que ahi una referencia si vale.
      if (char === "$" && source[i + 1] === "{") {
        stack.push({ kind: "code", depth: 0 });
        i += 2;
        continue;
      }

      i += 1;
      continue;
    }

    if (char === "/" && source[i + 1] === "/") {
      const end: number = source.indexOf("\n", i + 2);
      i = end === -1 ? source.length : end;
      continue;
    }

    if (char === "/" && source[i + 1] === "*") {
      const end: number = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    if (char === "'" || char === '"') {
      i = skipQuoted(source, i, char);
      continue;
    }

    if (char === "`") {
      stack.push({ kind: "template", depth: 0 });
      i += 1;
      continue;
    }

    if (char === "{") {
      REF_PATTERN.lastIndex = i;
      const match: RegExpExecArray | null = REF_PATTERN.exec(source);

      if (match) {
        const name: string = match[1];
        const known: boolean = knownNames.has(name);
        refs.push({ name, start: i, end: i + match[0].length, known });

        // Solo se sustituye lo que es un campo de verdad. Un {a} que no lo es se deja intacto y
        // sigue siendo JS legitimo -- una desestructuracion, un literal --, que es lo que hace
        // segura la sintaxis: para colisionar hace falta una variable que se llame igual que un
        // campo del formulario.
        if (known) {
          pieces.push(source.slice(copied, i), `${SCRIPT_VALUES_PARAM}[${JSON.stringify(name)}]`);
          i += match[0].length;
          copied = i;
          continue;
        }
      }

      frame.depth += 1;
      i += 1;
      continue;
    }

    if (char === "}") {
      // Con el contador en cero esta llave cierra el ${} que abrio este tramo, no una del codigo.
      if (frame.depth === 0 && stack.length > 1) {
        stack.pop();
      } else {
        frame.depth = Math.max(0, frame.depth - 1);
      }

      i += 1;
      continue;
    }

    i += 1;
  }

  pieces.push(source.slice(copied));

  return { code: pieces.join(""), refs };
}
