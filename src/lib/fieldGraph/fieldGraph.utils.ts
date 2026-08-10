import { compileScript } from "../fieldScript/fieldScript";

// Puente entre los dos espacios de nombres: los scripts hablan de campos por su nombre tecnico y
// el grafo trabaja con ids. Un nombre que no resuelve se descarta en silencio, porque el usuario
// esta escribiendo y a media palabra casi nada resuelve todavia.
export function scriptRefIds(
  source: string | undefined,
  byName: Map<string, string>,
  knownNames: Set<string>,
): string[] {
  if (!source) return [];

  const ids: string[] = [];

  for (const name of compileScript(source, knownNames).reads) {
    const id: string | undefined = byName.get(name);
    if (id) ids.push(id);
  }

  return ids;
}
