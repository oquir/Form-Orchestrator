import type { ApiBinding } from "../../types/field";
import type { PayloadDestination } from "../../types/payloadMapping";

export function destinationOf(binding: ApiBinding | undefined): PayloadDestination {
  if (binding?.kind === "excluded") return "excluded";
  if (binding?.kind === "concept") return "concept";

  return "contract";
}

// El binding con el que se estrena cada destino que no va al contrato. El concepto arranca sin id:
// el campo ya queda fuera del contrato mientras se escribe.
export function offContractBinding(destination: "concept" | "excluded"): ApiBinding {
  return destination === "concept" ? { kind: "concept" } : { kind: "excluded" };
}
