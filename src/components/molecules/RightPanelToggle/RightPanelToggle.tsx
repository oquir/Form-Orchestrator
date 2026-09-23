import { Sidebar2, SidebarRight2 } from "reicon-react";
import { useFormStore } from "../../../store/formStore";
import { IconButton } from "../../atoms/IconButton/IconButton";
import type { RightPanelToggleProps } from "./RightPanelToggle.types";

export function RightPanelToggle({ className = "", iconSize = 16 }: RightPanelToggleProps) {
  const isRightSidebarOpen: boolean = useFormStore((state) => state.isRightSidebarOpen);
  const setRightSidebarOpen = useFormStore((state) => state.setRightSidebarOpen);

  const label: string = isRightSidebarOpen ? "Plegar el panel" : "Mostrar el panel";
  const Icon = isRightSidebarOpen ? SidebarRight2 : Sidebar2;

  return (
    <IconButton
      onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
      title={label}
      aria-label={label}
      aria-expanded={isRightSidebarOpen}
      className={className}
    >
      <Icon size={iconSize} />
    </IconButton>
  );
}
