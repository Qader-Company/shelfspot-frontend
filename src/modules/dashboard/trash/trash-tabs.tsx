import { cn } from "@/shared/lib/utils";

interface TrashTabsProps {
  tabs: Array<{ key: string; label: string; count: number }>;
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TrashTabs({ tabs, activeTab, onTabChange }: TrashTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Trash categories"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white"
                : "border border-border bg-card text-foreground hover:bg-muted/50",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold leading-none",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-primary text-white",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
