import type { TabButtonGroupItem } from "../../../types/tabButtonGroup";

type TabVariant = NonNullable<TabButtonGroupItem<string>["variant"]>;

export const TAB_BASE_CLASSES = "rounded-md px-2 py-1 text-xs font-medium transition-colors";

export const TAB_VARIANT_CLASSES: Record<TabVariant, { active: string; inactive: string }> = {
  default: {
    active: "bg-orange-600 text-white dark:bg-orange-500 dark:text-white",
    inactive:
      "text-slate-500 hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-neutral-800 hover:cursor-pointer",
  },
  danger: {
    active: "bg-red-600 text-white dark:bg-red-500",
    inactive:
      "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 hover:cursor-pointer",
  },
};
