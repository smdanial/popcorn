import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Clapperboard,
  Film,
  Layers,
  Star,
  Tv,
} from "lucide-react";
import { Poster } from "@/components/poster";
import { StarRating } from "@/components/star-rating";
import { DiaryRow } from "@/components/diary-row";
import { EpisodeTracker } from "@/components/episode-tracker";
import { WatchActions } from "@/components/watch-actions";
import { LogWatchDialog } from "@/components/log-watch-dialog";
import { AddToList } from "@/components/add-to-list";
import { MediaCard } from "@/components/media-card";
import { SectionHeading } from "@/components/section-heading";
import { requireUser } from "@/lib/auth";
import { getMediaDetail } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { computeEpisodeProgress } from "@/lib/episode-progress";
import {
  formatDate,
  formatHoursMinutes,
  formatRuntime,
  formatYear,
  pluralize,
} from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: media?.title ?? "Title" };
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getMediaDetail(id, user.id);
  if (!data) notFound();

  const { media, libraryEntry, episodeWatches, lists, similar } = data;
  const isTv = media.type === "TV";
  const watchedIds = episodeWatches.map((watch) => watch.episodeId);
  const progress = computeEpisodeProgress(media.seasons, watchedIds);
  const year = formatYear(media.releaseDate);
  const latestRating =
    media.diaryEntries.find((entry) => entry.rating !== null)?.rating ??
    libraryEntry?.rating ??
    null;
  const latestWatch = media.diaryEntries[0]?.watchedAt ?? null;

  const episodeById = new Map(
    media.seasons.flatMap((season) =>
      season.episodes.map((episode) => [
        episode.id,
        { ...episode, seasonNumber: season.seasonNumber },
      ]),
    ),
  );
  const recentEpisodes = episodeWatches
    .slice(0, 6)
    .map((watch) => {
      const episode = episodeById.get(watch.episodeId);
      return episode ? { ...episode, watchedAt: watch.watchedAt } : null;
    })
    .filter(
      (
        episode,
      ): episode is NonNullable<typeof episode> => episode !== null,
    );

  const meta = [
    year,
    isTv
      ? `${media.seasons.length} ${pluralize(media.seasons.length, "season")}`
      : formatRuntime(media.runtime),
    media.voteAverage ? `TMDB ${media.voteAverage.toFixed(1)}` : null,
  ].filter(Boolean);

  const listsContaining = media.listItems.map((item) => item.list);

  return (
    <div className="pb-16">
      <div className="relative h-56 overflow-hidden border-b border-line sm:h-72 lg:h-80">
        {media.backdropPath && (
          <Image
            src={media.backdropPath}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/20" />
        <div className="container-page relative flex h-full items-start pt-5">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-mist backdrop-blur transition-colors hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Library
          </Link>
        </div>
      </div>

      <div className="container-page -mt-28 sm:-mt-32">
        <div className="flex flex-col items-start gap-6 sm:grid sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="relative z-10 w-32 sm:w-full">
            <Poster
              src={media.posterPath}
              alt={media.title}
              type={media.type}
              priority
              className="aspect-[2/3] w-full rounded-2xl border border-white/10 shadow-2xl"
              sizes="(max-width: 640px) 128px, 240px"
            />
          </div>

          <div className="relative z-10 min-w-0 pt-0 sm:pt-16 lg:pt-20">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-corn/20 bg-corn/10 text-corn">
                {isTv ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                {isTv ? "Series" : "Film"}
              </span>
              {media.genres.map((item) => (
                <span key={item.genreId} className="chip">
                  {item.genre.name}
                </span>
              ))}
              {isTv && progress.watchedEpisodes > 0 && (
                <span className="chip border-mint/20 bg-mint/10 text-mint">
                  {progress.percent}% tracked
                </span>
              )}
            </div>

            <h1 className="mt-3 text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
              {media.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist">
              {meta.map((item, index) => (
                <span key={String(item)} className="flex items-center gap-3">
                  {index > 0 && <span className="h-1 w-1 rounded-full bg-mist/50" />}
                  {item}
                </span>
              ))}
            </div>

            {media.tagline && (
              <p className="mt-4 border-l-2 border-corn/40 pl-3 text-sm italic text-mist">
                {media.tagline}
              </p>
            )}

            <p className="mt-4 max-w-2xl text-sm leading-6 text-mist">
              {media.overview || "No overview available yet."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {!isTv && (
                <LogWatchDialog
                  mediaId={media.id}
                  mediaTitle={media.title}
                  defaultRating={latestRating}
                />
              )}
              <WatchActions
                mediaId={media.id}
                status={libraryEntry?.status ?? null}
                favorite={libraryEntry?.favorite ?? false}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-mist">
              <span className="inline-flex items-center gap-1.5">
                <StarRating value={latestRating} size={13} showValue />
              </span>
              {latestWatch && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Last logged {formatDate(latestWatch)}
                </span>
              )}
              {isTv && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatHoursMinutes(progress.watchedMinutes)} of{" "}
                  {formatHoursMinutes(progress.totalMinutes)} watched
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page mt-10 sm:mt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            {isTv ? (
              <section id="episodes">
                <EpisodeTracker
                  seasons={media.seasons}
                  initialWatchedIds={watchedIds}
                />

                {recentEpisodes.length > 0 && (
                  <div className="card mt-6 overflow-hidden">
                    <div className="border-b border-line px-4 py-3.5 sm:px-5">
                      <h2 className="text-sm font-bold">Recently watched episodes</h2>
                    </div>
                    <ul className="divide-y divide-line">
                      {recentEpisodes.map((episode) => (
                        <li
                          key={episode.id}
                          className="flex items-center gap-3 px-4 py-3 sm:px-5"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-corn/15 text-corn">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-paper">
                              {episode.name}
                            </p>
                            <p className="text-[10px] text-mist">
                              S{episode.seasonNumber}E
                              {String(episode.episodeNumber).padStart(2, "0")} ·{" "}
                              {formatRuntime(episode.runtime) ?? "—"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] text-mist">
                            {formatDate(episode.watchedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ) : (
              <section>
                <SectionHeading
                  title="Your history"
                  subtitle={`${media.diaryEntries.length} ${pluralize(media.diaryEntries.length, "log")} for this film.`}
                  icon={<Clapperboard className="h-4 w-4 text-corn" />}
                />
                {media.diaryEntries.length > 0 ? (
                  <div className="card divide-y divide-line px-4 sm:px-5">
                    {media.diaryEntries.map((entry) => (
                      <DiaryRow
                        key={entry.id}
                        entry={{
                          ...entry,
                          media: {
                            id: media.id,
                            title: media.title,
                            posterPath: media.posterPath,
                            releaseDate: media.releaseDate,
                          },
                        }}
                        showDelete
                      />
                    ))}
                  </div>
                ) : (
                  <div className="card px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-paper">No watch history yet.</p>
                    <p className="mt-1 text-xs text-mist">
                      Log this film to add it to your diary and lifetime stats.
                    </p>
                  </div>
                )}
              </section>
            )}

            {similar.length > 0 && (
              <section>
                <SectionHeading
                  title="More like this"
                  subtitle={
                    isTv
                      ? "Other series sharing a genre."
                      : "Other films sharing a genre."
                  }
                  icon={<Layers className="h-4 w-4 text-mint" />}
                />
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                  {similar.map((item, index) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      priority={index < 3}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="text-sm font-bold">Details</h2>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-mist">Type</dt>
                  <dd className="text-right font-semibold text-paper">
                    {isTv ? "Series" : "Film"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-mist">Released</dt>
                  <dd className="text-right font-semibold text-paper">
                    {media.releaseDate ? formatDate(media.releaseDate) : "—"}
                  </dd>
                </div>
                {!isTv && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-mist">Runtime</dt>
                    <dd className="text-right font-semibold text-paper">
                      {formatRuntime(media.runtime) ?? "—"}
                    </dd>
                  </div>
                )}
                {isTv && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mist">Seasons</dt>
                      <dd className="text-right font-semibold text-paper">
                        {media.seasons.length}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mist">Episodes</dt>
                      <dd className="text-right font-semibold text-paper">
                        {progress.totalEpisodes}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-mist">Total runtime</dt>
                      <dd className="text-right font-semibold text-paper">
                        {formatHoursMinutes(progress.totalMinutes)}
                      </dd>
                    </div>
                  </>
                )}
                {media.voteAverage && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-mist">TMDB score</dt>
                    <dd className="inline-flex items-center gap-1 text-right font-semibold text-corn">
                      <Star className="h-3 w-3 fill-current" />
                      {media.voteAverage.toFixed(1)}
                    </dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 border-t border-line pt-3">
                  <dt className="text-mist">Your rating</dt>
                  <dd className="text-right">
                    <StarRating value={latestRating} size={12} showValue />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="card p-5">
              <AddToList
                mediaId={media.id}
                lists={lists}
                listsContaining={listsContaining}
              />
            </div>

            {isTv && (
              <div className="rounded-2xl border border-ember/20 bg-ember/[0.06] p-4">
                <p className="eyebrow text-ember">How TV time works</p>
                <p className="mt-2 text-[11px] leading-5 text-mist">
                  Every checked episode adds its own runtime to your lifetime
                  total. Mark a whole season in one click, or tick episodes as
                  you go.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
