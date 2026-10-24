import { cn } from "@/lib/utils";

const STAR_PATH =
  "M12 2.6l2.98 5.94 6.55.95-4.74 4.62 1.12 6.53L12 17.56l-5.91 3.08 1.12-6.53-4.74-4.62 6.55-.95L12 2.6z";

function StarShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d={STAR_PATH}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRating({
  value,
  size = 14,
  className,
  showValue = false,
}: {
  value: number | null | undefined;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  if (value === null || value === undefined || value <= 0) {
    return showValue ? (
      <span className={cn("text-xs text-mist", className)}>Not rated</span>
    ) : null;
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.min(1, Math.max(0, value - index));
          return (
            <span
              key={index}
              className="relative inline-block text-white/20"
              style={{ width: size, height: size }}
            >
              <StarShape className="absolute inset-0" />
              <span
                className="absolute inset-0 overflow-hidden text-corn"
                style={{ width: `${fill * 100}%` }}
              >
                <StarShape className="absolute left-0 top-0" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-[11px] font-semibold text-mist">
          {value.toFixed(1).replace(/\.0$/, "")}
        </span>
      )}
    </span>
  );
}

export function RatingBadge({
  rating,
  className,
}: {
  rating: number | null | undefined;
  className?: string;
}) {
  if (rating === null || rating === undefined) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-corn/20 bg-corn/10 px-2 py-0.5 text-[11px] font-bold text-corn",
        className,
      )}
    >
      <StarShape className="h-3 w-3" />
      {rating.toFixed(1)}
    </span>
  );
}
