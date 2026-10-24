import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Heart, Plus, Tv } from "lucide-react";
import { MediaCard, type MediaCardItem } from "@/components/media-card";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeEpisodeProgress } from "@/lib/episode-progress";
import { formatHoursMinutes, formatRuntime } from "@/lib/format";
import { LIBRARY_STATUSES, STATUS_LABELS, type LibraryStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Library" };

type StatusFilter = "ALL" | LibraryStatus;
type TypeFilter = "ALL" | "MOVIE" | "TV";

const statusTabs: StatusFilter[] = ["ALL", ...LIBRARY_STATUSES];
const typeTabs: Array<{ value: TypeFilter; label: string }> = [
  { value: "ALL", label: "Everything" },
  { value: "MOVIE", label: "Films" },
  { value: "TV", label: "Series" },
];

function buildHref(params: {
  status: StatusFilter;
  type: TypeFilter;
}) {
  const query = new URLSearchParams();
  if (params.status !== "ALL") query.set("status", params.status);
  if (params.type !== "ALL") query.set("type", params.type);
  const suffix = query.toString();
  return suffix ? `/library?${suffix}` : "/library";
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const status: StatusFilter = statusTabs.includes(params.status as StatusFilter)
    ? (params.status as StatusFilter)
    : "ALL";
  const type: TypeFilter = ["MOVIE", "TV"].includes(params.type ?? "")
    ? (params.type as TypeFilter)
    : "ALL";

  const [entries, episodeWatches] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: {
        media: {
          include: {
            seasons: {
              include: { episodes: { select: { id: true, runtime: true } } },
            },
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.episodeWatch.findMany({
      where: { userId: user.id },
      select: {
        episodeId: true,
        episode: { select: { season: { select: { mediaId: true } } } },
      },
    }),
  ]);

  const watchedByMedia = new Map<string, Set<string>>();
  for (const watch of episodeWatches) {
    const mediaId = watch.episode.season.mediaId;
    const set = watchedByMedia.get(mediaId) ?? new Set<string>();
    set.add(watch.episodeId);
    watchedByMedia.set(mediaId, set);
  }

  const typeEntries = entries.filter(
    (entry) => type === "ALL" || entry.media.type === type,
  );
  const filtered = typeEntries.filter(
    (entry) => status === "ALL" || entry.status === status,
  );

  const cards: Array<MediaCardItem & { status: string; favorite: boolean }> =
    filtered.map((entry) => {
      const watched = watchedByMedia.get(entry.mediaId) ?? new Set<string>();
      const progress =
        entry.media.type === "TV"
          ? computeEpisodeProgress(entry.media.seasons, watched)
          : null;

      return {
        id: entry.media.id,
        title: entry.media.title,
        posterPath: entry.media.posterPath,
        type: entry.media.type,
        releaseDate: entry.media.releaseDate,
        rating: entry.rating,
        runtimeLabel:
          entry.media.type === "TV"
            ? progress && progress.watchedEpisodes > 0
              ? `${progress.watchedEpisodes}/${progress.totalEpisodes} eps`
              : "Series"
            : formatRuntime(entry.media.runtime),
        progress:
          progress && progress.watchedEpisodes > 0 ? progress.percent : null,
        progressLabel:
          progress && progress.watchedEpisodes > 0
            ? `${formatHoursMinutes(progress.watchedMinutes)} watched`
            : null,
        status: entry.status,
        favorite: entry.favorite,
      };
    });

  const counts = (value: StatusFilter) =>
    typeEntries.filter((entry) => value === "ALL" || entry.status === value).length;

  const favorites = entries.filter((entry) => entry.favorite).length;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-corn">
            <Clapperboard className="h-3.5 w-3.5" />
            Your library
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Saved, started, finished.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-mist">
            {entries.length} titles in the collection, {favorites} marked as
            favourites. Watchlist items live here until you press play.
          </p>
        </div>
        <Link href="/search" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add a title
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {typeTabs.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status, type: tab.value })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                type === tab.value
                  ? "border-corn/30 bg-corn/15 text-corn"
                  : "border-line bg-panel/50 text-mist hover:border-white/20 hover:text-paper",
              )}
            >
              {tab.label}
            </Link>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-mist sm:flex">
            <Heart className="h-3.5 w-3.5 text-ember" />
            {favorites} favourites
          </span>
        </div>

        <div className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto border-b border-line px-1">
          {statusTabs.map((tab) => (
            <Link
              key={tab}
              href={buildHref({ status: tab, type })}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-xs font-semibold transition-colors",
                status === tab ? "text-paper" : "text-mist hover:text-paper",
              )}
            >
              {tab === "ALL" ? "All" : STATUS_LABELS[tab]}
              <span className="ml-1.5 text-[10px] font-normal text-mist/70">
                {counts(tab)}
              </span>
              {status === tab && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-corn" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-7">
        {cards.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6">
            {cards.map((card, index) => (
              <MediaCard key={card.id} item={card} priority={index < 4} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={type === "TV" ? Tv : Clapperboard}
            title="Nothing here yet"
            description={
              status === "PLAN"
                ? "Your watchlist is empty. Search TMDB and bookmark something for later."
                : "Try a different filter, or add a new title to your library."
            }
            actionLabel="Browse titles"
            actionHref="/search"
          />
        )}
      </div>
    </div>
  );
}
