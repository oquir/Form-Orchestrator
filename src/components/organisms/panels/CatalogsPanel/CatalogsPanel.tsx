import { CATALOGS } from "../../../../constants/catalog";
import { useFormStore } from "../../../../store/formStore";
import { CatalogCard } from "../../../molecules/CatalogCard/CatalogCard";
import { HINT_CLASSES } from "./CatalogsPanel.constants";

export function CatalogsPanel() {
  const catalogBank = useFormStore((state) => state.catalogBank);

  return (
    <div className="flex flex-col gap-3">
      <p className={HINT_CLASSES}>
        Las opciones que el simulador ofrece en cada campo de catálogo. Cada uno elige entre los
        datos de prueba que trae el simulador y los que cargues vos; cambiar de uno a otro no borra
        lo cargado. No viajan en el JSON exportado y no dependen del borrador: se comparten entre
        todos tus formularios, así que los departamentos que cargues acá los hereda el de retención.
      </p>

      {CATALOGS.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} stored={catalogBank[catalog.id]} />
      ))}
    </div>
  );
}
