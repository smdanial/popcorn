import type { DayPoint } from "@/lib/stats";
import { formatDate, formatHoursMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function levelClass(minutes: number) {
  if (minutes === 0) return "bg-white/[0.045]";
  if (minutes <= 30) return "bg-corn/25";
  if (minutes <= 60) return "bg-corn/45";
  if (minutes <= 120) return "bg-corn/70";
  return "bg-corn";
}

export function ActivityHeatmap({ daily }: { daily: DayPoint[] }) {
  if (daily.length === 0) return null;

  const leading = daily[0].date.getUTCDay();
  const cells: Array<DayPoint | null> = [
    ...Array.from({ length: leading }, () => null),
    ...daily,
  ];

  return (
    <div>
      <div className="flex gap-2">
        <div className="grid shrink-0 grid-rows-7 gap-1 pt-px text-[9px] leading-none text-mist/50">
          {weekdays.map((day) => (
            <span key={day} className="h-2.5">
              {day.slice(0, 2)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-none">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
            {cells.map((day, index) =>
              day ? (
                <span
                  key={day.key}
                  title={`${formatDate(day.date)} · ${
                    day.minutes > 0 ? formatHoursMinutes(day.minutes) : "No watch time"
                  }`}
                  aria-label={`${formatDate(day.date)}: ${day.minutes} minutes watched`}
                  className={cn(
                    "h-2.5 w-2.5 rounded-[2px]",
                    levelClass(day.minutes),
                  )}
                />
              ) : (
                <span key={`blank-${index}`} className="h-2.5 w-2.5" />
              ),
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-[10px] text-mist">
        <span>Each square is one day of watch time.</span>
        <span className="flex items-center gap-1.5">
          Less
          <span className="h-2.5 w-2.5 rounded-[2px] bg-white/[0.045]" />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-corn/25" />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-corn/45" />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-corn/70" />
          <span className="h-2.5 w-2.5 rounded-[2px] bg-corn" />
          More
        </span>
      </div>
    </div>
  );
}
