import type { CanvasField } from "../../../store/formStore";
import { useFormStore } from "../../../store/formStore";
import { SavedComponentListItem } from "../../molecules/SavedComponentListItem";
import { SaveFieldForm } from "../../molecules/SaveFieldForm";

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

      <div>
        <h3 className="mb-2 text-xs font-semibold text-slate-500 dark:text-neutral-400">
          Componentes guardados
        </h3>
        {savedComponents.length === 0 ? (
          <p className="text-xs text-slate-300 dark:text-neutral-600">
            No hay componentes guardados aún.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {savedComponents.map((component) => (
              <SavedComponentListItem key={component.id} component={component} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
