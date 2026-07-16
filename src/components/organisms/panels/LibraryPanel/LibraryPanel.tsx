import { useFormStore } from "../../../../store/formStore";
import type { CanvasField } from "../../../../types/storeTypes";
import { SavedComponentListItem } from "../../../molecules/SavedComponentListItem/SavedComponentListItem";
import { SaveFieldForm } from "../../../molecules/SaveFieldForm/SaveFieldForm";

export function LibraryPanel({ selectedField }: { selectedField: CanvasField | null }) {
  const savedComponents = useFormStore((state) => state.savedComponents);

  return (
    <div className="flex flex-col gap-4">
      {selectedField && (
        <SaveFieldForm
          fieldId={selectedField.id}
          label={`Guardar "${selectedField.label}" como componente reutilizable`}
          containerClassName="rounded-md border border-slate-200 p-3 dark:border-neutral-700"
        />
      )}

      <section aria-labelledby="saved-components-heading">
        <h3
          id="saved-components-heading"
          className="mb-2 text-xs font-semibold text-slate-500 dark:text-neutral-400"
        >
          Componentes guardados
        </h3>
        {savedComponents.length === 0 ? (
          <p className="text-xs text-slate-300 dark:text-neutral-600">
            No hay componentes guardados aún.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-1.5">
            {savedComponents.map((component) => (
              <li key={component.id}>
                <SavedComponentListItem component={component} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
