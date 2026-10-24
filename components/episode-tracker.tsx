"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  CircleDashed,
  Clock3,
  Loader2,
  Tv,
} from "lucide-react";
import { setSeasonWatched, toggleEpisode } from "@/lib/actions/episodes";
import { computeEpisodeProgress } from "@/lib/episode-progress";
import { formatHoursMinutes, formatRuntime } from "@/lib/format";
import { ProgressBar } from "@/components/progress-bar";
import { cn } from "@/lib/utils";

type EpisodeItem = {
  id: string;
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
  airDate: Date | null;
  stillPath: string | null;
};

type SeasonItem = {
  id: string;
  seasonNumber: number;
  name: string;
  episodes: EpisodeItem[];
};

export function EpisodeTracker({
  seasons,
  initialWatchedIds,
}: {
  seasons: SeasonItem[];
  initialWatchedIds: string[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [watched, setWatched] = useState(() => new Set(initialWatchedIds));
  const [pendingEpisode, setPendingEpisode] = useState<string | null>(null);
  const [pendingSeason, setPendingSeason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialKey = useMemo(
    () => [...initialWatchedIds].sort().join("|"),
    [initialWatchedIds],
  );

  useEffect(() => {
    setWatched(new Set(initialWatchedIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const progress = useMemo(
    () => computeEpisodeProgress(seasons, watched),
    [seasons, watched],
  );

  const firstIncompleteSeason = useMemo(() => {
    for (const season of seasons) {
      if (season.episodes.some((episode) => !watched.has(episode.id))) {
        return season.id;
      }
    }
    return seasons[0]?.id ?? null;
  }, [seasons, watched]);

  function handleEpisode(episodeId: string) {
    if (pendingEpisode || pendingSeason) return;
    const wasWatched = watched.has(episodeId);
    setError(null);
    setPendingEpisode(episodeId);

    setWatched((previous) => {
      const next = new Set(previous);
      if (wasWatched) next.delete(episodeId);
      else next.add(episodeId);
      return next;
    });

    startTransition(async () => {
      const result = await toggleEpisode(episodeId);
      setPendingEpisode(null);
      if (!result.ok) {
        setError(result.error ?? "Could not update this episode.");
        setWatched((previous) => {
          const next = new Set(previous);
          if (wasWatched) next.add(episodeId);
          else next.delete(episodeId);
          return next;
        });
        return;
      }
      router.refresh();
    });
  }

  function handleSeason(season: SeasonItem) {
    if (pendingEpisode || pendingSeason) return;
    const allWatched = season.episodes.every((episode) => watched.has(episode.id));
    const snapshot = new Set(watched);
    setError(null);
    setPendingSeason(season.id);

    setWatched((previous) => {
      const next = new Set(previous);
      for (const episode of season.episodes) {
        if (allWatched) next.delete(episode.id);
        else next.add(episode.id);
      }
      return next;
    });

    startTransition(async () => {
      const result = await setSeasonWatched(season.id, !allWatched);
      setPendingSeason(null);
      if (!result.ok) {
        setError(result.error ?? "Could not update this season.");
        setWatched(snapshot);
        return;
      }
      router.refresh();
    });
  }

  if (seasons.length === 0) {
    return (
      <div className="card p-6 text-sm text-mist">
        No episode data is available for this series yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-1.5 text-corn">
              <Tv className="h-3.5 w-3.5" />
              Episode tracker
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight">
              {progress.percent}% complete
            </p>
            <p className="mt-1 text-xs text-mist">
              {progress.watchedEpisodes} of {progress.totalEpisodes} episodes ·{" "}
              {formatHoursMinutes(progress.watchedMinutes)} of{" "}
              {formatHoursMinutes(progress.totalMinutes)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mist">Time watched</p>
              <p className="mt-1 text-lg font-bold text-corn">
                {formatHoursMinutes(progress.watchedMinutes)}
              </p>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mist">Remaining</p>
              <p className="mt-1 text-lg font-bold text-paper">
                {formatHoursMinutes(progress.totalMinutes - progress.watchedMinutes)}
              </p>
            </div>
          </div>
        </div>
        <ProgressBar
          value={progress.percent}
          className="h-1.5 rounded-none bg-white/[0.05]"
          barClassName="rounded-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-ember/30 bg-ember/10 px-3.5 py-2.5 text-xs text-[#ffb7a6]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {seasons.map((season) => {
          const seasonWatched = season.episodes.filter((episode) =>
            watched.has(episode.id),
          ).length;
          const allWatched =
            season.episodes.length > 0 && seasonWatched === season.episodes.length;
          const seasonMinutes = season.episodes.reduce(
            (sum, episode) => sum + (episode.runtime ?? 0),
            0,
          );

          return (
            <details
              key={season.id}
              open={season.id === firstIncompleteSeason}
              className="group/card card overflow-hidden"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-5 [&::-webkit-details-marker]:hidden">
                <ChevronRight className="h-4 w-4 shrink-0 text-mist transition-transform group-open/card:rotate-90" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-paper">
                    {season.name || `Season ${season.seasonNumber}`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist">
                    {seasonWatched}/{season.episodes.length} episodes ·{" "}
                    {formatHoursMinutes(seasonMinutes)}
                  </p>
                </div>
                <div className="hidden w-28 sm:block">
                  <ProgressBar
                    value={
                      season.episodes.length === 0
                        ? 0
                        : (seasonWatched / season.episodes.length) * 100
                    }
                    className="h-1"
                  />
                </div>
                {allWatched ? (
                  <span className="chip border-mint/20 bg-mint/10 text-mint">
                    <Check className="h-3 w-3" />
                    Done
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-mist">
                    {season.episodes.length - seasonWatched} left
                  </span>
                )}
              </summary>

              <div className="border-t border-line">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
                  <p className="flex items-center gap-1.5 text-[11px] text-mist">
                    <Clock3 className="h-3.5 w-3.5" />
                    Check episodes as you finish them
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSeason(season)}
                    disabled={Boolean(pendingSeason || pendingEpisode)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-mist transition-colors hover:border-corn/30 hover:text-corn disabled:opacity-50"
                  >
                    {pendingSeason === season.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : allWatched ? (
                      <CircleDashed className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {allWatched ? "Unmark season" : "Mark season"}
                  </button>
                </div>

                <ul className="divide-y divide-line/70">
                  {season.episodes.map((episode) => {
                    const isWatched = watched.has(episode.id);
                    const isPending = pendingEpisode === episode.id;
                    return (
                      <li key={episode.id}>
                        <button
                          type="button"
                          onClick={() => handleEpisode(episode.id)}
                          disabled={Boolean(pendingEpisode || pendingSeason)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.025] disabled:cursor-wait sm:px-5",
                            isWatched && "bg-white/[0.015]",
                          )}
                          aria-pressed={isWatched}
                        >
                          <span
                            className={cn(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                              isWatched
                                ? "border-corn bg-corn text-ink"
                                : "border-white/15 bg-transparent text-transparent",
                            )}
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-mist" />
                            ) : (
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            )}
                          </span>

                          <span className="w-10 shrink-0 font-mono text-[11px] text-mist">
                            {season.seasonNumber}x
                            {String(episode.episodeNumber).padStart(2, "0")}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-[13px] font-medium",
                                isWatched ? "text-mist" : "text-paper",
                              )}
                            >
                              {episode.name}
                            </span>
                            {episode.overview && (
                              <span className="mt-0.5 block truncate text-[11px] text-mist/65">
                                {episode.overview}
                              </span>
                            )}
                          </span>

                          <span className="shrink-0 text-[11px] text-mist">
                            {formatRuntime(episode.runtime) ?? "—"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
