import { useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { LabeledInput } from "../../molecules/LabeledInput/LabeledInput";
import { ModalActions } from "../../molecules/ModalActions/ModalActions";
import { ModalShell } from "../../molecules/ModalShell/ModalShell";
import type { AddToggleGroupModalProps } from "./AddToggleGroupModal.types";

export function AddToggleGroupModal({ onConfirm, onCancel }: AddToggleGroupModalProps) {
  const [title, setTitle] = useState<string>("");
  const [optionCount, setOptionCount] = useState<number>(2);
  const isValid = optionCount >= 2;

  return (
    <ModalShell>
      <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-neutral-100">
        Agregar Toggle Buttons
      </h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-neutral-400">
        Definí cuántas opciones tendrá el grupo. Podrás editar sus etiquetas después.
      </p>

      <div className="mb-4 flex flex-col gap-4">
        <LabeledInput
          id="toggle-group-title"
          label="Título del grupo (opcional)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Frecuencia de pago"
        />

        <LabeledInput
          id="toggle-group-count"
          label="Cantidad de opciones"
          type="number"
          min={2}
          value={optionCount}
          onChange={(event) => setOptionCount(Number(event.target.value))}
        />
      </div>

      <ModalActions>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!isValid}
          onClick={() => onConfirm({ title: title.trim() || undefined, optionCount })}
          className="px-4 py-1.5 text-sm hover:cursor-pointer"
        >
          Agregar
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
