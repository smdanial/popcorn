import type { MonthPoint } from "@/lib/stats";
import { formatHoursMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MonthChart({ months }: { months: MonthPoint[] }) {
  const max = Math.max(...months.map((month) => month.minutes), 1);

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2.5">
        {months.map((month, index) => {
          const totalHeight = Math.max(2, (month.minutes / max) * 100);
          const movieShare = month.minutes > 0 ? (month.movieMinutes / month.minutes) * 100 : 0;
          const tvShare = month.minutes > 0 ? (month.tvMinutes / month.minutes) * 100 : 0;
          const showYear = index === 0 || month.label === "Jan";

          return (
            <div key={month.key} className="group flex h-full min-w-0 flex-1 flex-col">
              <div className="relative flex flex-1 items-end">
                <div
                  className={cn(
                    "flex w-full flex-col-reverse overflow-hidden rounded-t-[5px] transition-opacity",
                    month.minutes === 0
                      ? "h-0.5 bg-white/10"
                      : "bg-white/[0.04] group-hover:opacity-80",
                  )}
                  style={month.minutes === 0 ? undefined : { height: `${totalHeight}%` }}
                  title={`${month.label} ${month.year}: ${formatHoursMinutes(month.minutes)}`}
                >
                  {month.minutes > 0 && (
                    <>
                      <div className="w-full bg-ember/85" style={{ height: `${tvShare}%` }} />
                      <div className="w-full bg-corn/90" style={{ height: `${movieShare}%` }} />
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="block text-[10px] font-medium text-mist">
                  {month.label}
                </span>
                <span className="hidden text-[9px] text-mist/60 sm:block">
                  {showYear ? month.year : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[11px] text-mist">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-corn" /> Films
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-ember" /> TV episodes
        </span>
      </div>
    </div>
  );
}
