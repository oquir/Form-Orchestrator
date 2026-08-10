// El borrador antes de pasar por Zod: viene de localStorage, que se puede editar desde las
// devtools, asi que hasta que valide no se le supone ninguna forma.
export type LooseDraft = Record<string, unknown>;

export type DraftMigration = (draft: LooseDraft) => LooseDraft;
