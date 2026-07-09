export function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
    </div>
  );
}
