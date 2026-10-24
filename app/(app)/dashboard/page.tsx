import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChartBar,
  Clock3,
  Eye,
  Film,
  ListVideo,
  Plus,
  Sparkles,
  Tv,
} from "lucide-react";
import { MediaCard, type MediaCardItem } from "@/components/media-card";
import { MediaGrid } from "@/components/media-grid";
import { SectionHeading } from "@/components/section-heading";
import { DiaryRow } from "@/components/diary-row";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries";
import {
  formatCompactHours,
  formatHoursMinutes,
  formatNumber,
  formatRuntime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Home" };

function uniqueByMedia<T extends { mediaId: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.mediaId)) return false;
    seen.add(item.mediaId);
    return true;
  });
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const { stats } = data;

  const recent = uniqueByMedia(data.recentDiary).slice(0, 8);
  const recentCards: MediaCardItem[] = recent.map((entry) => ({
    id: entry.media.id,
    title: entry.media.title,
    posterPath: entry.media.posterPath,
    type: entry.media.type,
    releaseDate: entry.media.releaseDate,
    rating: entry.rating,
    runtimeLabel:
      entry.media.type === "MOVIE" ? formatRuntime(entry.media.runtime) : "Series",
  }));

  const watchlistCards: MediaCardItem[] = data.watchlist.map((entry) => ({
    id: entry.media.id,
    title: entry.media.title,
    posterPath: entry.media.posterPath,
    type: entry.media.type,
    releaseDate: entry.media.releaseDate,
    voteAverage: entry.media.voteAverage,
    runtimeLabel:
      entry.media.type === "MOVIE" ? formatRuntime(entry.media.runtime) : "Series",
  }));

  const backdrop = recent[0]?.media.backdropPath ?? data.watchlist[0]?.media.backdropPath;
  const topGenre = stats.genres[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          {backdrop && (
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        </div>

        <div className="container-page relative py-10 sm:py-14">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-2 text-corn">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome back, {user.name.split(" ")[0]}
              </p>
              <h1 className="mt-3 max-w-2xl text-balance text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
                Your screen life,
                <br />
                <span className="text-corn">in perspective.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-mist sm:text-base">
                You have spent{" "}
                <span className="font-semibold text-paper">
                  {formatNumber(stats.totalHours)} hours
                </span>{" "}
                — {stats.totalDays.toFixed(1)} full days — inside other worlds.
                That is {stats.movieLogs} film logs and {stats.episodeCount}{" "}
                episodes, all accounted for.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link href="/search" className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Add something to watch
                </Link>
                <Link href="/stats" className="btn-secondary">
                  <ChartBar className="h-4 w-4" />
                  Lifetime stats
                </Link>
                {topGenre && (
                  <span className="chip hidden border-corn/15 bg-corn/5 text-corn sm:inline-flex">
                    Favourite genre: {topGenre.label}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 lg:w-[360px]">
              <div className="rounded-2xl border border-corn/20 bg-corn/10 p-3.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-corn/80">
                  Lifetime
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-corn">
                  {formatNumber(stats.totalHours)}
                  <span className="ml-0.5 text-xs">h</span>
                </p>
                <p className="mt-0.5 text-[10px] text-corn/60">
                  {stats.totalDays.toFixed(1)} days
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-panel/70 p-3.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-mist">
                  Daily avg
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-paper">
                  {stats.averageDailyMinutes}
                  <span className="ml-0.5 text-xs text-mist">m</span>
                </p>
                <p className="mt-0.5 text-[10px] text-mist">since first log</p>
              </div>
              <div className="rounded-2xl border border-line bg-panel/70 p-3.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-mist">
                  Episodes
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-paper">
                  {stats.episodeCount}
                </p>
                <p className="mt-0.5 text-[10px] text-mist">
                  {stats.showCount} series
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-12">
            {data.continueWatching.length > 0 && (
              <section>
                <SectionHeading
                  title="Continue watching"
                  subtitle="Pick up exactly where you left off."
                  href="/library?status=WATCHING"
                  icon={<Tv className="h-4 w-4 text-ember" />}
                />
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
                  {data.continueWatching.map(({ entry, progress }) => (
                    <MediaCard
                      key={entry.id}
                      item={{
                        id: entry.media.id,
                        title: entry.media.title,
                        posterPath: entry.media.posterPath,
                        type: entry.media.type,
                        releaseDate: entry.media.releaseDate,
                        progress: progress.percent,
                        progressLabel: `${progress.watchedEpisodes}/${progress.totalEpisodes} eps · ${formatHoursMinutes(progress.watchedMinutes)}`,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeading
                title="Recently watched"
                subtitle="The latest trips through the screen."
                href="/diary"
                icon={<Eye className="h-4 w-4 text-corn" />}
              />
              {recentCards.length > 0 ? (
                <MediaGrid items={recentCards} priorityCount={4} />
              ) : (
                <EmptyState
                  icon={Film}
                  title="No diary entries yet"
                  description="Log your first film and PopCorn will start turning hours into a story."
                  actionLabel="Find a film"
                  actionHref="/search"
                />
              )}
            </section>

            <section>
              <SectionHeading
                title="Your watchlist"
                subtitle={`${data.watchlist.length} titles waiting for the right night.`}
                href="/library?status=PLAN"
              />
              {watchlistCards.length > 0 ? (
                <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none sm:gap-4">
                  {watchlistCards.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      className="w-[124px] shrink-0 sm:w-[148px]"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Plus}
                  title="Your watchlist is empty"
                  description="Search for something that looks interesting. Future you can decide."
                  actionLabel="Browse TMDB"
                  actionHref="/search"
                />
              )}
            </section>

            <section>
              <SectionHeading
                title="Your lists"
                subtitle="Small canons, carefully argued."
                href="/lists"
                icon={<ListVideo className="h-4 w-4 text-mint" />}
              />
              {data.lists.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {data.lists.map((list) => (
                    <Link
                      key={list.id}
                      href={`/lists/${list.id}`}
                      className="card group flex flex-col p-3.5 transition-colors hover:border-white/20"
                    >
                      <div className="flex h-20 items-center -space-x-5 pl-1">
                        {list.items.slice(0, 3).map((item, index) => (
                          <div
                            key={item.id}
                            className={cn(
                              "relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-lg transition-transform group-hover:-translate-y-0.5",
                              index === 0 && "rotate-[-4deg]",
                              index === 2 && "rotate-[4deg]",
                            )}
                          >
                            {item.media.posterPath ? (
                              <Image
                                src={item.media.posterPath}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-panel2" />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 truncate text-sm font-bold text-paper group-hover:text-corn">
                        {list.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-mist">
                        {list.items.length} {list.items.length === 1 ? "title" : "titles"}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ListVideo}
                  title="No lists yet"
                  description="Rank a genre, collect a mood, or start an argument."
                  actionLabel="Create a list"
                  actionHref="/lists"
                />
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="card sticky top-24 overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <CalendarDays className="h-4 w-4 text-corn" />
                  Recent diary
                </h2>
                <Link
                  href="/diary"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-mist hover:text-corn"
                >
                  All entries
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-line px-4">
                {data.recentDiary.slice(0, 5).map((entry) => (
                  <DiaryRow key={entry.id} entry={entry} compact showReview />
                ))}
                {data.recentDiary.length === 0 && (
                  <p className="py-8 text-center text-xs text-mist">
                    Your diary is waiting for its first entry.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-corn" />
                Lifetime snapshot
              </p>
              <div className="mt-4 space-y-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-mist">Films logged</span>
                  <span className="text-sm font-bold text-paper">{stats.movieLogs}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-mist">Unique films</span>
                  <span className="text-sm font-bold text-paper">{stats.uniqueMovies}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-mist">Episodes watched</span>
                  <span className="text-sm font-bold text-paper">{stats.episodeCount}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-mist">Active days</span>
                  <span className="text-sm font-bold text-paper">{stats.activeDays}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-mist">Avg film rating</span>
                  <span className="text-sm font-bold text-corn">
                    {stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "—"}
                  </span>
                </div>
              </div>
              <Link
                href="/stats"
                className="btn-secondary mt-4 w-full py-2 text-xs"
              >
                Open the full dashboard
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <StatCard
                icon={Film}
                label="Film time"
                value={formatCompactHours(stats.movieMinutes)}
                sub={formatHoursMinutes(stats.movieMinutes)}
                tone="corn"
              />
              <StatCard
                icon={Tv}
                label="TV time"
                value={formatCompactHours(stats.tvMinutes)}
                sub={formatHoursMinutes(stats.tvMinutes)}
                tone="ember"
              />
            </div>

            {stats.longestDay && (
              <div className="rounded-2xl border border-line bg-gradient-to-br from-panel to-coal p-4">
                <p className="eyebrow text-[10px]">Biggest binge</p>
                <p className="mt-2 text-sm font-bold text-paper">
                  {formatHoursMinutes(stats.longestDay.minutes)}{" "}
                  <span className="font-normal text-mist">in one day</span>
                </p>
                <p className="mt-1 text-[11px] text-mist">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(stats.longestDay.date)}
                </p>
              </div>
            )}

            <p className="px-2 text-center text-[10px] leading-5 text-mist/70">
              Film time counts full runtimes for every diary log. Series time is
              calculated episode by episode.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
