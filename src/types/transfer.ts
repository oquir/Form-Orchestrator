// Mudar algo de un paso a otro. La carga es lo unico que cambia entre un campo y una fila entera;
// las reglas, el aterrizaje y el aviso son los mismos, y por eso viven en un solo sitio.
export type TransferPayload = { kind: "field"; fieldId: string } | { kind: "row"; rowId: string };

export interface TransferCheck {
  allowed: boolean;
  reason?: string;
}

export type TransferTabState = "idle" | "ready" | "rejected";
