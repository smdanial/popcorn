import Link from "next/link";
import { Star, Tv } from "lucide-react";
import { Poster } from "@/components/poster";
import { ProgressBar } from "@/components/progress-bar";
import { formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MediaCardItem = {
  id: string;
  title: string;
  posterPath: string | null;
  type: string;
  releaseDate?: Date | string | null;
  year?: string | number | null;
  rating?: number | null;
  voteAverage?: number | null;
  runtimeLabel?: string | null;
  progress?: number | null;
  progressLabel?: string | null;
};

export function MediaCard({
  item,
  priority = false,
  className,
}: {
  item: MediaCardItem;
  priority?: boolean;
  className?: string;
}) {
  const year = item.year ?? formatYear(item.releaseDate ?? null);

  return (
    <Link
      href={`/media/${item.id}`}
      className={cn("group block min-w-0", className)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] bg-panel2 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/15 group-hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,1)]">
        <Poster
          src={item.posterPath}
          alt={item.title}
          type={item.type}
          priority={priority}
          className="h-full w-full rounded-xl"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 190px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {item.type === "TV" && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            <Tv className="h-3 w-3" />
            Series
          </span>
        )}

        {item.voteAverage ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-corn text-corn" />
            {item.voteAverage.toFixed(1)}
          </span>
        ) : null}

        <div className="absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex w-full items-center justify-center rounded-full bg-corn px-2 py-1.5 text-[11px] font-bold text-ink">
            Open title
          </span>
        </div>
      </div>

      <div className="mt-2.5">
        <h3 className="truncate text-[13px] font-semibold leading-5 text-paper transition-colors group-hover:text-corn sm:text-sm">
          {item.title}
        </h3>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-mist">
          <span className="truncate">
            {[year, item.runtimeLabel].filter(Boolean).join(" · ")}
          </span>
          {item.rating ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-corn">
              <Star className="h-3 w-3 fill-current" />
              {item.rating.toFixed(1).replace(/\.0$/, "")}
            </span>
          ) : null}
        </div>
        {item.progress !== null && item.progress !== undefined && (
          <div className="mt-2">
            <ProgressBar value={item.progress} className="h-1" />
            {item.progressLabel && (
              <p className="mt-1.5 text-[10px] text-mist">{item.progressLabel}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
