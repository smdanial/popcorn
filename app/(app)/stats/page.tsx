import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  ChartBar,
  Clock3,
  Film,
  Flame,
  Sparkles,
  Star,
  Tv,
} from "lucide-react";
import { BarList } from "@/components/bar-list";
import { MonthChart } from "@/components/month-chart";
import { Poster } from "@/components/poster";
import { SplitDonut } from "@/components/split-donut";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { getUserStats } from "@/lib/stats-data";
import {
  formatDate,
  formatHoursMinutes,
  formatNumber,
  pluralize,
} from "@/lib/format";

export const metadata: Metadata = { title: "Lifetime stats" };

export default async function StatsPage() {
  const user = await requireUser();
  const stats = await getUserStats(user.id);

  if (stats.totalMinutes === 0) {
    return (
      <div className="container-page py-12">
        <p className="eyebrow text-corn">Lifetime analytics</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
          Every hour, accounted for.
        </h1>
        <div className="mt-8">
          <EmptyState
            icon={Clock3}
            title="No watch time yet"
            description="Log a film or tick off an episode and this page will begin calculating your lifetime in front of the screen."
            actionLabel="Find something to watch"
            actionHref="/search"
          />
        </div>
      </div>
    );
  }

  const avgActiveDay =
    stats.activeDays > 0 ? Math.round(stats.totalMinutes / stats.activeDays) : 0;
  const yearPercent = (stats.totalDays / 365) * 100;
  const topGenre = stats.genres[0];
  const genreItems = stats.genres.slice(0, 8);
  const topTitles = stats.topTitles.slice(0, 6);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-corn">
            <ChartBar className="h-3.5 w-3.5" />
            Lifetime analytics
          </p>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Every hour, accounted for.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
            Not a guilt trip. A receipt. This is the exact time you have spent
            with films and series, calculated from runtimes and episode-level
            check-ins.
          </p>
        </div>
        <Link href="/diary" className="btn-secondary shrink-0">
          <CalendarDays className="h-4 w-4" />
          View diary
        </Link>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <section className="card relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(600px 260px at 90% 0%, rgba(247,201,72,0.13), transparent 65%)",
            }}
          />
          <div className="relative">
            <p className="eyebrow">Total time in other worlds</p>
            <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="text-6xl font-black leading-none tracking-[-0.04em] text-paper sm:text-7xl">
                {formatNumber(stats.totalHours)}
                <span className="ml-1 text-2xl font-bold text-corn">h</span>
              </p>
              <p className="pb-2 text-sm text-mist">
                {formatHoursMinutes(stats.totalMinutes)}
              </p>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-mist">
              That is{" "}
              <span className="font-semibold text-paper">
                {stats.totalDays.toFixed(2)} entire days
              </span>{" "}
              — about {yearPercent.toFixed(1)}% of a calendar year spent inside
              stories.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mist">Films</p>
                <p className="mt-1 text-lg font-bold text-corn">
                  {formatHoursMinutes(stats.movieMinutes)}
                </p>
                <p className="text-[10px] text-mist">{stats.movieLogs} logs</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mist">Television</p>
                <p className="mt-1 text-lg font-bold text-ember">
                  {formatHoursMinutes(stats.tvMinutes)}
                </p>
                <p className="text-[10px] text-mist">{stats.episodeCount} episodes</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mist">Per day</p>
                <p className="mt-1 text-lg font-bold text-paper">
                  {formatHoursMinutes(stats.averageDailyMinutes)}
                </p>
                <p className="text-[10px] text-mist">lifetime avg.</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-mist">Per active day</p>
                <p className="mt-1 text-lg font-bold text-paper">
                  {formatHoursMinutes(avgActiveDay)}
                </p>
                <p className="text-[10px] text-mist">{stats.activeDays} active days</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold">The split</h2>
            <span className="chip">Lifetime</span>
          </div>
          <SplitDonut
            moviePercent={stats.moviePercent}
            tvPercent={stats.tvPercent}
            totalHours={stats.totalHours}
            totalDays={stats.totalDays}
          />
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Film}
          label="Film time"
          value={formatHoursMinutes(stats.movieMinutes)}
          sub={`${stats.uniqueMovies} unique films`}
          tone="corn"
        />
        <StatCard
          icon={Tv}
          label="Series time"
          value={formatHoursMinutes(stats.tvMinutes)}
          sub={`${stats.showCount} shows · ${stats.episodeCount} eps`}
          tone="ember"
        />
        <StatCard
          icon={Flame}
          label="Biggest day"
          value={stats.longestDay ? formatHoursMinutes(stats.longestDay.minutes) : "—"}
          sub={stats.longestDay ? formatDate(stats.longestDay.date) : undefined}
          tone="mint"
        />
        <StatCard
          icon={Star}
          label="Avg film rating"
          value={stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "—"}
          sub={`${stats.movieLogs} rated viewings`}
          tone="sky"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Your genres, by time</h2>
              <p className="mt-1 text-[11px] text-mist">
                Multi-genre titles count toward each genre.
              </p>
            </div>
            {topGenre && (
              <span className="chip border-corn/20 bg-corn/10 text-corn">
                {topGenre.label}
              </span>
            )}
          </div>
          <BarList
            items={genreItems.map((genre) => ({
              label: genre.label,
              minutes: genre.minutes,
              count: genre.count,
            }))}
          />
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold">The last 12 months</h2>
            <p className="mt-1 text-[11px] text-mist">
              Movie time and episode time, stacked month by month.
            </p>
          </div>
          <MonthChart months={stats.months} />
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold">By year watched</h2>
            <p className="mt-1 text-[11px] text-mist">
              Every logged film and checked-off episode.
            </p>
          </div>
          <BarList
            items={stats.calendarYears.map((year) => ({
              label: year.label,
              minutes: year.minutes,
              count: year.count,
            }))}
            color="bg-mint"
          />
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold">By release era</h2>
            <p className="mt-1 text-[11px] text-mist">
              When the things you watch were made, not when you watched them.
            </p>
          </div>
          <BarList
            items={stats.releaseDecades.map((decade) => ({
              label: decade.label,
              minutes: decade.minutes,
              count: decade.count,
            }))}
            color="bg-sky"
          />
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card min-w-0 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold">Most time spent</h2>
            <span className="text-[11px] text-mist">Top 6</span>
          </div>
          <div className="divide-y divide-line">
            {topTitles.map((title, index) => (
              <Link
                key={title.mediaId}
                href={`/media/${title.mediaId}`}
                className="group flex items-center gap-3 py-3"
              >
                <span className="w-5 shrink-0 font-mono text-[11px] text-mist/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Poster
                  src={title.posterPath}
                  alt={title.title}
                  type={title.type}
                  className="h-14 w-10 shrink-0 rounded-md"
                  sizes="40px"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-paper group-hover:text-corn">
                    {title.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist">
                    {title.type === "TV" ? "Series" : "Film"} ·{" "}
                    {title.count} {title.type === "TV" ? "episodes" : "logs"}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-mist">
                  {formatHoursMinutes(title.minutes)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="min-w-0 space-y-4">
          <section className="card p-5">
            <p className="eyebrow flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-corn" />
              The fine print
            </p>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">First watch</dt>
                <dd className="font-semibold text-paper">
                  {stats.firstWatchedAt ? formatDate(stats.firstWatchedAt) : "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Most recent</dt>
                <dd className="font-semibold text-paper">
                  {stats.lastWatchedAt ? formatDate(stats.lastWatchedAt) : "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Active days</dt>
                <dd className="font-semibold text-paper">
                  {stats.activeDays} {pluralize(stats.activeDays, "day")}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Average daily</dt>
                <dd className="font-semibold text-paper">
                  {formatHoursMinutes(stats.averageDailyMinutes)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-mist">Film vs TV</dt>
                <dd className="font-semibold text-paper">
                  {stats.moviePercent}% / {stats.tvPercent}%
                </dd>
              </div>
            </dl>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-corn/20 bg-gradient-to-br from-corn/10 via-panel to-panel p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-corn/10 blur-2xl" />
            <p className="eyebrow text-corn">Perspective</p>
            <p className="mt-2 text-sm font-bold leading-6 text-paper">
              {stats.totalDays.toFixed(2)} days is roughly{" "}
              {Math.round(stats.totalMinutes / 120)} feature-length films back
              to back.
            </p>
            <p className="mt-2 text-[11px] leading-5 text-mist">
              And still only {yearPercent.toFixed(1)}% of a year. Cinema is
              efficient like that.
            </p>
          </section>
        </aside>
      </div>

      <p className="mt-8 text-center text-[10px] leading-5 text-mist/60">
        Film time is calculated from TMDB runtimes at the moment of logging.
        Series time uses each episode&apos;s runtime, with a 45-minute fallback
        when TMDB has no data.
      </p>
    </div>
  );
}
