import { VIEW_MODE_TABS } from "../../../constants/canvasView";
import {
  SWITCH_ITEM_ACTIVE_CLASSES,
  SWITCH_ITEM_BASE_CLASSES,
  SWITCH_ITEM_INACTIVE_CLASSES,
  SWITCH_TRACK_CLASSES,
  VIEW_MODE_ICONS,
} from "./ViewModeSwitch.constants";
import type { ViewModeSwitchProps } from "./ViewModeSwitch.types";

export function ViewModeSwitch({ activeMode, onSelect }: ViewModeSwitchProps) {
  return (
    <div className={SWITCH_TRACK_CLASSES}>
      {VIEW_MODE_TABS.map((item) => {
        const Icon = VIEW_MODE_ICONS[item.tab];
        const isActive: boolean = activeMode === item.tab;

        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onSelect(item.tab)}
            aria-pressed={isActive}
            className={`${SWITCH_ITEM_BASE_CLASSES} ${
              isActive ? SWITCH_ITEM_ACTIVE_CLASSES : SWITCH_ITEM_INACTIVE_CLASSES
            }`}
          >
            <Icon size={13} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
