import { formatHoursMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BarItem = {
  label: string;
  minutes: number;
  count?: number;
};

export function BarList({
  items,
  color = "bg-corn",
  emptyLabel = "Nothing here yet.",
  className,
}: {
  items: BarItem[];
  color?: string;
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-mist">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.minutes), 1);

  return (
    <div className={cn("space-y-3.5", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-paper">
              {item.label}
              {item.count !== undefined && (
                <span className="ml-1.5 text-[10px] font-normal text-mist">
                  ({item.count})
                </span>
              )}
            </span>
            <span className="shrink-0 font-semibold text-mist">
              {formatHoursMinutes(item.minutes)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full transition-all duration-700", color)}
              style={{ width: `${Math.max(2, (item.minutes / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
