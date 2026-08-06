import { Button } from "../../atoms/Button/Button";
import { ModalActions } from "../../atoms/ModalActions/ModalActions";
import { ModalShell } from "../../atoms/ModalShell/ModalShell";
import type { DraftRecoveryModalProps } from "./DraftRecoveryModal.types";

export function DraftRecoveryModal({
  draft,
  renamed,
  onRestore,
  onDiscard,
}: DraftRecoveryModalProps) {
  const savedAtLabel = new Date(draft.savedAt).toLocaleString();

  return (
    <ModalShell maxWidthClassName="max-w-md">
      <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        Se encontró un borrador
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-neutral-400">
        Hay un proyecto guardado automáticamente el {savedAtLabel}. ¿Quieres restaurarlo o empezar
        de nuevo?
      </p>

      {renamed.length > 0 && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
            {renamed.length === 1
              ? "Se corrigió 1 nombre técnico repetido."
              : `Se corrigieron ${renamed.length} nombres técnicos repetidos.`}
          </p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {renamed.map((rename) => (
              <li
                key={`${rename.from}-${rename.to}`}
                className="text-[11px] text-amber-700 dark:text-amber-400"
              >
                <code>{rename.from}</code> → <code>{rename.to}</code> ({rename.label})
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
            Revisá las fórmulas y condiciones que los usen: seguían apuntando al nombre viejo.
          </p>
        </div>
      )}

      <ModalActions>
        <Button
          variant="ghost"
          onClick={onDiscard}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Empezar de nuevo
        </Button>
        <Button
          variant="primary"
          onClick={onRestore}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Restaurar borrador
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
