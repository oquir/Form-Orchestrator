import { CATALOGS } from "../../../../constants/catalog";
import { HINT_CLASSES } from "../../../../constants/uiClasses";
import { useFormStore } from "../../../../store/formStore";
import { CatalogCard } from "../../../molecules/CatalogCard/CatalogCard";
import { ValoresAnualesEditor } from "../ValoresAnualesEditor/ValoresAnualesEditor";

export function CatalogsPanel() {
  const catalogBank = useFormStore((state) => state.catalogBank);

  return (
    <div className="flex flex-col gap-3">
      <p className={HINT_CLASSES}>
        Los datos que el simulador usa para poder calcular: las opciones de cada campo de catálogo y
        los valores anuales que en el aplicativo real llegan por API. Cada uno elige entre los datos
        de prueba que trae el simulador y los que cargues vos; cambiar de uno a otro no borra lo
        cargado. No viajan en el JSON exportado y no dependen del borrador: se comparten entre todos
        tus formularios, así que los departamentos que cargues acá los hereda el de retención.
      </p>

      <ValoresAnualesEditor />

      {CATALOGS.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} stored={catalogBank[catalog.id]} />
      ))}
    </div>
  );
}
