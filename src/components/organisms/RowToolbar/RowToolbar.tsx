import { useState } from "react";
import { Xmark } from "reicon-react";
import { CHROME_ON_ROW_CLASSES, CHROME_PINNED_CLASSES } from "../../../constants/uiClasses";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { RowDragHandle } from "../../atoms/RowDragHandle/RowDragHandle";
import { RowColumnsMenu } from "../RowColumnsMenu/RowColumnsMenu";
import { RowStylesMenu } from "../RowStylesMenu/RowStylesMenu";
import { ROW_TOOLBAR_CLASSES, ROW_TOOLBAR_DANGER_ITEM_CLASSES } from "./RowToolbar.constants";
import type { RowToolbarMenu, RowToolbarProps } from "./RowToolbar.types";

export function RowToolbar({ row, listeners, attributes, pinned }: RowToolbarProps) {
  const removeRow = useFormStore((state) => state.removeRow);
  // El estado de los dos desplegables vive aca y no dentro de cada menu por dos razones: los hace
  // excluyentes sin que ninguno sepa del otro, y la barra necesita saber que hay uno abierto para
  // no desvanecerse justo cuando el puntero sale de la fila hacia el desplegable.
  const [openMenu, setOpenMenu] = useState<RowToolbarMenu | null>(null);

  function toggleMenu(menu: RowToolbarMenu): void {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  const isVisible: boolean = pinned || openMenu !== null;

  return (
    <div
      className={`${ROW_TOOLBAR_CLASSES} ${isVisible ? CHROME_PINNED_CLASSES : CHROME_ON_ROW_CLASSES}`}
    >
      <RowDragHandle listeners={listeners} attributes={attributes} />

      <RowColumnsMenu
        rowId={row.id}
        columns={row.columns}
        isOpen={openMenu === "columns"}
        onToggle={() => toggleMenu("columns")}
        onClose={() => setOpenMenu(null)}
      />

      <RowStylesMenu
        rowId={row.id}
        styles={row.styles}
        isOpen={openMenu === "styles"}
        onToggle={() => toggleMenu("styles")}
        onClose={() => setOpenMenu(null)}
      />

      <IconButton
        onClick={() => removeRow(row.id)}
        title="Eliminar fila"
        aria-label="Eliminar fila"
        className={ROW_TOOLBAR_DANGER_ITEM_CLASSES}
      >
        <Xmark size={12} weight="Filled" />
      </IconButton>
    </div>
  );
}
