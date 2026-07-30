import { Layers, Plus, Xmark } from "reicon-react";
import { PAYLOAD_SCHEMA } from "../../../constants/payloadSchema";
import { arrayPaths } from "../../../lib/payloadSchema/payloadSchema";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { CanvasRow } from "../CanvasRow/CanvasRow";
import {
  BAND_ACTION_CLASSES,
  BAND_CLASSES,
  BAND_INPUT_CLASSES,
  BAND_NUMBER_CLASSES,
} from "./RepeatableGroupBand.constants";
import type { RepeatableGroupBandProps } from "./RepeatableGroupBand.types";

export function RepeatableGroupBand({ group, rows, onFieldContextMenu }: RepeatableGroupBandProps) {
  const updateGroup = useFormStore((state) => state.updateGroup);
  const addRowToGroup = useFormStore((state) => state.addRowToGroup);
  const removeGroup = useFormStore((state) => state.removeGroup);
  const paths: string[] = arrayPaths(PAYLOAD_SCHEMA);

  return (
    <li className={BAND_CLASSES}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
          <Layers size={14} weight="Filled" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Repetible</span>
        </span>

        <input
          type="text"
          value={group.title}
          onChange={(event) => updateGroup(group.id, { title: event.target.value })}
          placeholder="Título del grupo"
          className={`${BAND_INPUT_CLASSES} min-w-0 flex-1`}
        />

        <button
          type="button"
          onClick={() => addRowToGroup(group.id)}
          className={BAND_ACTION_CLASSES}
        >
          <span className="flex items-center gap-1">
            <Plus size={11} weight="Filled" /> Fila
          </span>
        </button>

        <IconButton
          onClick={() => removeGroup(group.id)}
          title="Disolver el grupo (las filas se quedan)"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 text-sky-500 hover:cursor-pointer hover:border-red-300 hover:text-red-500 dark:border-sky-500/40 dark:text-sky-300"
        >
          <Xmark size={11} weight="Filled" />
        </IconButton>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-slate-500 dark:text-neutral-400">
        <label className="flex items-center gap-1.5">
          Mínimo
          <input
            type="number"
            min={0}
            value={group.min}
            onChange={(event) => updateGroup(group.id, { min: Number(event.target.value) })}
            className={BAND_NUMBER_CLASSES}
          />
        </label>

        <label className="flex items-center gap-1.5">
          Máximo
          <input
            type="number"
            min={1}
            value={group.max}
            onChange={(event) => updateGroup(group.id, { max: Number(event.target.value) })}
            className={BAND_NUMBER_CLASSES}
          />
        </label>

        <label className="flex items-center gap-1.5">
          Arreglo del payload
          <select
            value={group.arrayPath ?? ""}
            onChange={(event) =>
              updateGroup(group.id, { arrayPath: event.target.value || undefined })
            }
            className={BAND_INPUT_CLASSES}
          >
            <option value="">— Sin mapear —</option>
            {paths.map((path) => (
              <option key={path} value={path}>
                {path}[]
              </option>
            ))}
          </select>
        </label>

        <span className="text-slate-400 dark:text-neutral-500">
          {group.arrayPath
            ? `Cada repetición es un ítem de ${group.arrayPath}[].`
            : "Elegí el arreglo para poder mapear los campos de adentro."}
        </span>
      </div>

      <ul className="grid list-none grid-cols-16 content-start gap-3">
        {rows.map((row) => (
          <CanvasRow key={row.id} row={row} onFieldContextMenu={onFieldContextMenu} />
        ))}
      </ul>
    </li>
  );
}
