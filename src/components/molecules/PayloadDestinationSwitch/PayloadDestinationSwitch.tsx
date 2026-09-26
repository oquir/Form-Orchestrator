import {
  SWITCH_ITEM_ACTIVE_CLASSES,
  SWITCH_ITEM_BASE_CLASSES,
  SWITCH_ITEM_INACTIVE_CLASSES,
  SWITCH_TRACK_CLASSES,
} from "../../../constants/uiClasses";
import {
  PAYLOAD_DESTINATIONS,
  SWITCH_ITEM_DISABLED_CLASSES,
} from "./PayloadDestinationSwitch.constants";
import type { PayloadDestinationSwitchProps } from "./PayloadDestinationSwitch.types";

export function PayloadDestinationSwitch({
  destination,
  disabledReasons,
  onChange,
}: PayloadDestinationSwitchProps) {
  return (
    <div className={SWITCH_TRACK_CLASSES}>
      {PAYLOAD_DESTINATIONS.map((item) => {
        const isActive: boolean = destination === item.destination;
        const disabledReason: string | undefined = disabledReasons[item.destination];

        return (
          <button
            key={item.destination}
            type="button"
            onClick={() => onChange(item.destination)}
            disabled={disabledReason !== undefined}
            title={disabledReason ?? item.hint}
            aria-pressed={isActive}
            className={`${SWITCH_ITEM_BASE_CLASSES} ${SWITCH_ITEM_DISABLED_CLASSES} ${
              isActive ? SWITCH_ITEM_ACTIVE_CLASSES : SWITCH_ITEM_INACTIVE_CLASSES
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
