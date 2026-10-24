import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Plus,
  Repeat2,
  Star,
} from "lucide-react";
import { DiaryRow } from "@/components/diary-row";
import { Poster } from "@/components/poster";
import { StarRating } from "@/components/star-rating";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatHoursMinutes, formatMonth, formatYear, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Diary" };

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: user.id },
    include: { media: true },
    orderBy: { watchedAt: "desc" },
  });

  const years = [...new Set(entries.map((entry) => entry.watchedAt.getUTCFullYear()))].sort(
    (a, b) => b - a,
  );
  const requestedYear = Number(params.year);
  const selectedYear = years.includes(requestedYear) ? requestedYear : null;
  const visible = selectedYear
    ? entries.filter((entry) => entry.watchedAt.getUTCFullYear() === selectedYear)
    : entries;

  const months = new Map<
    string,
    { date: Date; entries: typeof visible; minutes: number }
  >();

  for (const entry of visible) {
    const key = monthKey(entry.watchedAt);
    const group = months.get(key) ?? {
      date: new Date(Date.UTC(entry.watchedAt.getUTCFullYear(), entry.watchedAt.getUTCMonth(), 1)),
      entries: [],
      minutes: 0,
    };
    group.entries.push(entry);
    group.minutes += entry.media.runtime ?? 0;
    months.set(key, group);
  }

  const minutes = visible.reduce((sum, entry) => sum + (entry.media.runtime ?? 0), 0);
  const rewatches = visible.filter((entry) => entry.rewatch).length;
  const rated = visible.filter((entry) => entry.rating !== null);
  const averageRating =
    rated.length > 0
      ? rated.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) / rated.length
      : null;

  const topRated = [...visible]
    .filter((entry) => entry.rating !== null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-corn">
            <BookOpen className="h-3.5 w-3.5" />
            The diary
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Every viewing, dated.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-mist">
            {entries.length} entries across{" "}
            {years.length} {pluralize(years.length, "year")}. Ratings, reviews,
            rewatches — and the runtimes that quietly turn into statistics.
          </p>
        </div>
        <Link href="/search" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Log a film
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Entries"
          value={String(visible.length)}
          sub={selectedYear ? `in ${selectedYear}` : "all time"}
          tone="corn"
        />
        <StatCard
          icon={Clock3}
          label="Film time"
          value={formatHoursMinutes(minutes)}
          sub="from this diary"
          tone="ember"
        />
        <StatCard
          icon={Repeat2}
          label="Rewatches"
          value={String(rewatches)}
          sub="repeat viewings"
          tone="mint"
        />
        <StatCard
          icon={Star}
          label="Average rating"
          value={averageRating ? `${averageRating.toFixed(1)} / 5` : "—"}
          sub={`${rated.length} rated`}
          tone="sky"
        />
      </div>

      {years.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <Link
            href="/diary"
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              !selectedYear
                ? "border-corn/30 bg-corn/15 text-corn"
                : "border-line bg-panel/50 text-mist hover:text-paper",
            )}
          >
            All time
          </Link>
          {years.map((year) => (
            <Link
              key={year}
              href={`/diary?year=${year}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                selectedYear === year
                  ? "border-corn/30 bg-corn/15 text-corn"
                  : "border-line bg-panel/50 text-mist hover:text-paper",
              )}
            >
              {year}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {visible.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="The diary is empty"
              description="Find a film, log when you watched it, and give it a rating. The stats page will do the arithmetic."
              actionLabel="Find a film"
              actionHref="/search"
            />
          ) : (
            [...months.values()].map((group) => (
              <section key={group.date.toISOString()} className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                  <div>
                    <h2 className="text-sm font-bold text-paper">
                      {formatMonth(group.date)}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-mist">
                      {group.entries.length}{" "}
                      {pluralize(group.entries.length, "entry", "entries")} ·{" "}
                      {formatHoursMinutes(group.minutes)}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-mist/60">
                    {formatYear(group.date)}
                  </span>
                </div>
                <div className="divide-y divide-line px-4 sm:px-5">
                  {group.entries.map((entry) => (
                    <DiaryRow key={entry.id} entry={entry} showDelete />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="card sticky top-24 p-5">
            <p className="eyebrow flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-corn" />
              Highest rated
            </p>
            {topRated.length > 0 ? (
              <div className="mt-4 space-y-3">
                {topRated.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/media/${entry.media.id}`}
                    className="group flex items-center gap-3"
                  >
                    <Poster
                      src={entry.media.posterPath}
                      alt={entry.media.title}
                      type={entry.media.type}
                      className="h-14 w-10 shrink-0 rounded-md"
                      sizes="40px"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-paper group-hover:text-corn">
                        {entry.media.title}
                      </p>
                      <StarRating
                        value={entry.rating}
                        size={10}
                        className="mt-1"
                        showValue
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs leading-5 text-mist">
                Rate a few entries and your favourites will collect here.
              </p>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] leading-5 text-mist">
                Every diary log adds its full runtime to your film total —
                including rewatches. That is the deal.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
