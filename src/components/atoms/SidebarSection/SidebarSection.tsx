import type { SidebarSectionProps } from "./SidebarSection.types";

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <section className="mb-5 flex flex-col gap-2 last:mb-0">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
        {title}
      </h3>
      {children}
    </section>
  );
}
