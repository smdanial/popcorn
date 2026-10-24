import { formatNumber } from "@/lib/format";

export function SplitDonut({
  moviePercent,
  tvPercent,
  totalHours,
  totalDays,
}: {
  moviePercent: number;
  tvPercent: number;
  totalHours: number;
  totalDays: number;
}) {
  const safePercent = Math.min(100, Math.max(0, moviePercent));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full p-[14px] shadow-[0_0_60px_-20px_rgba(247,201,72,0.35)]"
        style={{
          background: `conic-gradient(#f7c948 0 ${safePercent}%, #ff6b4a ${safePercent}% 100%)`,
        }}
        role="img"
        aria-label={`${moviePercent}% films and ${tvPercent}% television`}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/5 bg-panel text-center">
          <span className="text-2xl font-extrabold tracking-tight text-paper">
            {formatNumber(totalHours)}
            <span className="ml-0.5 text-xs font-semibold text-mist">h</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-mist">
            {totalDays.toFixed(2)} days
          </span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-paper">
              <span className="h-2.5 w-2.5 rounded-full bg-corn" /> Films
            </span>
            <span className="font-bold text-corn">{moviePercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-corn" style={{ width: `${moviePercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-paper">
              <span className="h-2.5 w-2.5 rounded-full bg-ember" /> Television
            </span>
            <span className="font-bold text-ember">{tvPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-ember" style={{ width: `${tvPercent}%` }} />
          </div>
        </div>
        <p className="text-[11px] leading-5 text-mist">
          Each film log counts its full runtime, including rewatches. TV time is
          built from individual episodes you have checked off.
        </p>
      </div>
    </div>
  );
}
