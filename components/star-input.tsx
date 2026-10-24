"use client";

import { useState } from "react";
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

export function StarInput({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
        role="group"
        aria-label="Star rating"
      >
        {Array.from({ length: 5 }, (_, starIndex) => {
          const fill = Math.min(1, Math.max(0, shown - starIndex));
          return (
            <span
              key={starIndex}
              className="relative text-white/20"
              style={{ width: size, height: size }}
            >
              <StarShape className="absolute inset-0" />
              <span
                className="absolute inset-0 overflow-hidden text-corn"
                style={{ width: `${fill * 100}%` }}
              >
                <StarShape className="absolute left-0 top-0" />
              </span>
              <button
                type="button"
                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l"
                aria-label={`Rate ${starIndex + 0.5} stars`}
                onMouseEnter={() => setHovered(starIndex + 0.5)}
                onClick={() => onChange(starIndex + 0.5)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r"
                aria-label={`Rate ${starIndex + 1} stars`}
                onMouseEnter={() => setHovered(starIndex + 1)}
                onClick={() => onChange(starIndex + 1)}
              />
            </span>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-mist">
        {value > 0 ? `${value.toFixed(1).replace(/\.0$/, "")} / 5` : "No rating"}
      </span>
      {value > 0 && (
        <button
          type="button"
          onClick={() => {
            setHovered(null);
            onChange(0);
          }}
          className={cn("text-[11px] font-medium text-mist hover:text-paper")}
        >
          Clear
        </button>
      )}
    </div>
  );
}
