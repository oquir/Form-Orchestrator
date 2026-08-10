// Lo que queda en `cycle` no entra en `order`: se deja fuera en vez de colarse al final, para que
// el simulador pueda avisar en lugar de dar un cero que parece bueno.
export interface DerivedPlan {
  order: string[];
  cycle: string[] | null;
}
