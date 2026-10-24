export type WatchEventType = "MOVIE" | "TV";

export type WatchEvent = {
  id: string;
  mediaId: string;
  title: string;
  posterPath: string | null;
  type: WatchEventType;
  minutes: number;
  watchedAt: Date;
  genres: string[];
  releaseYear: number | null;
  rating: number | null;
};

export type Breakdown = {
  label: string;
  minutes: number;
  count: number;
  percent: number;
};

export type MonthPoint = {
  key: string;
  label: string;
  year: number;
  minutes: number;
  movieMinutes: number;
  tvMinutes: number;
};

export type DayPoint = {
  key: string;
  date: Date;
  minutes: number;
};

export type TitleTime = {
  mediaId: string;
  title: string;
  posterPath: string | null;
  type: WatchEventType;
  minutes: number;
  count: number;
};

export type LifetimeStats = {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  movieMinutes: number;
  tvMinutes: number;
  moviePercent: number;
  tvPercent: number;
  movieLogs: number;
  uniqueMovies: number;
  episodeCount: number;
  showCount: number;
  firstWatchedAt: Date | null;
  lastWatchedAt: Date | null;
  activeDays: number;
  averageDailyMinutes: number;
  longestDay: { date: Date; minutes: number } | null;
  averageRating: number | null;
  longestStreak: number;
  latestStreak: number;
  weekday: Breakdown[];
  genres: Breakdown[];
  releaseDecades: Breakdown[];
  calendarYears: Breakdown[];
  months: MonthPoint[];
  daily: DayPoint[];
  topTitles: TitleTime[];
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function toBreakdown(
  map: Map<string, { minutes: number; count: number; order: number }>,
  total: number,
) {
  return [...map.entries()]
    .map(([label, value]) => ({
      label,
      minutes: Math.round(value.minutes),
      count: value.count,
      percent: percent(value.minutes, total),
      order: value.order,
    }))
    .sort((a, b) => b.minutes - a.minutes || a.order - b.order)
    .map((entry) => ({
      label: entry.label,
      minutes: entry.minutes,
      count: entry.count,
      percent: entry.percent,
    }));
}

export function buildLifetimeStats(
  events: WatchEvent[],
  now: Date = new Date(),
): LifetimeStats {
  const sorted = [...events]
    .filter((event) => event.watchedAt instanceof Date && !Number.isNaN(event.watchedAt.getTime()))
    .sort((a, b) => a.watchedAt.getTime() - b.watchedAt.getTime());

  const totalMinutes = Math.round(
    sorted.reduce((sum, event) => sum + Math.max(0, event.minutes), 0),
  );

  const movieEvents = sorted.filter((event) => event.type === "MOVIE");
  const tvEvents = sorted.filter((event) => event.type === "TV");
  const movieMinutes = Math.round(
    movieEvents.reduce((sum, event) => sum + Math.max(0, event.minutes), 0),
  );
  const tvMinutes = totalMinutes - movieMinutes;

  const uniqueMovies = new Set(movieEvents.map((event) => event.mediaId)).size;
  const showCount = new Set(tvEvents.map((event) => event.mediaId)).size;

  const genreMap = new Map<string, { minutes: number; count: number; order: number }>();
  const decadeMap = new Map<string, { minutes: number; count: number; order: number }>();
  const yearMap = new Map<string, { minutes: number; count: number; order: number }>();
  const titleMap = new Map<string, TitleTime>();
  const dayMap = new Map<string, { date: Date; minutes: number }>();
  const weekdayMap = new Map<string, { minutes: number; count: number; order: number }>();
  const ratings: number[] = [];

  for (const event of sorted) {
    const minutes = Math.max(0, event.minutes);

    event.genres.forEach((genre, index) => {
      const existing = genreMap.get(genre) ?? { minutes: 0, count: 0, order: index };
      existing.minutes += minutes;
      existing.count += 1;
      genreMap.set(genre, existing);
    });

    if (event.releaseYear) {
      const decade = `${Math.floor(event.releaseYear / 10) * 10}s`;
      const decadeEntry = decadeMap.get(decade) ?? {
        minutes: 0,
        count: 0,
        order: Math.floor(event.releaseYear / 10),
      };
      decadeEntry.minutes += minutes;
      decadeEntry.count += 1;
      decadeMap.set(decade, decadeEntry);
    }

    const watchedYear = String(event.watchedAt.getUTCFullYear());
    const yearEntry = yearMap.get(watchedYear) ?? {
      minutes: 0,
      count: 0,
      order: Number(watchedYear),
    };
    yearEntry.minutes += minutes;
    yearEntry.count += 1;
    yearMap.set(watchedYear, yearEntry);

    const titleEntry = titleMap.get(event.mediaId) ?? {
      mediaId: event.mediaId,
      title: event.title,
      posterPath: event.posterPath,
      type: event.type,
      minutes: 0,
      count: 0,
    };
    titleEntry.minutes += minutes;
    titleEntry.count += 1;
    titleMap.set(event.mediaId, titleEntry);

    const key = dayKey(event.watchedAt);
    const dayEntry = dayMap.get(key) ?? {
      date: new Date(`${key}T00:00:00.000Z`),
      minutes: 0,
    };
    dayEntry.minutes += minutes;
    dayMap.set(key, dayEntry);

    const weekdayLabel = WEEKDAY_LABELS[event.watchedAt.getUTCDay()];
    const weekdayEntry = weekdayMap.get(weekdayLabel) ?? {
      minutes: 0,
      count: 0,
      order: event.watchedAt.getUTCDay(),
    };
    weekdayEntry.minutes += minutes;
    weekdayEntry.count += 1;
    weekdayMap.set(weekdayLabel, weekdayEntry);

    if (event.rating !== null) ratings.push(event.rating);
  }

  const firstWatchedAt = sorted[0]?.watchedAt ?? null;
  const lastWatchedAt = sorted[sorted.length - 1]?.watchedAt ?? null;
  const activeDays = dayMap.size;

  let averageDailyMinutes = 0;
  if (totalMinutes > 0 && firstWatchedAt) {
    const firstDay = Date.UTC(
      firstWatchedAt.getUTCFullYear(),
      firstWatchedAt.getUTCMonth(),
      firstWatchedAt.getUTCDate(),
    );
    const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const span = Math.max(1, Math.floor((currentDay - firstDay) / 86_400_000) + 1);
    averageDailyMinutes = Math.round(totalMinutes / span);
  }

  const longestDay =
    [...dayMap.values()].sort((a, b) => b.minutes - a.minutes)[0] ?? null;

  const activeDayKeys = [...dayMap.keys()].sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDay: number | null = null;
  for (const key of activeDayKeys) {
    const dayNumber = Math.floor(
      new Date(`${key}T00:00:00.000Z`).getTime() / 86_400_000,
    );
    runningStreak =
      previousDay !== null && dayNumber - previousDay === 1
        ? runningStreak + 1
        : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDay = dayNumber;
  }
  let latestStreak = 0;
  for (let index = activeDayKeys.length - 1; index >= 0; index -= 1) {
    if (index === activeDayKeys.length - 1) {
      latestStreak = 1;
      continue;
    }
    const current = Math.floor(
      new Date(`${activeDayKeys[index]}T00:00:00.000Z`).getTime() / 86_400_000,
    );
    const next = Math.floor(
      new Date(`${activeDayKeys[index + 1]}T00:00:00.000Z`).getTime() / 86_400_000,
    );
    if (next - current !== 1) break;
    latestStreak += 1;
  }

  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daily: DayPoint[] = [];
  for (let offset = 364; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * 86_400_000);
    const key = dayKey(date);
    daily.push({
      key,
      date,
      minutes: Math.round(dayMap.get(key)?.minutes ?? 0),
    });
  }

  const months: MonthPoint[] = [];
  for (let offset = 11; offset >= 0; offset -= 1) {
    const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const key = cursor.toISOString().slice(0, 7);
    months.push({
      key,
      label: MONTH_LABELS[cursor.getUTCMonth()],
      year: cursor.getUTCFullYear(),
      minutes: 0,
      movieMinutes: 0,
      tvMinutes: 0,
    });
  }
  const monthIndex = new Map(months.map((month) => [month.key, month]));
  for (const event of sorted) {
    const key = event.watchedAt.toISOString().slice(0, 7);
    const month = monthIndex.get(key);
    if (!month) continue;
    const minutes = Math.max(0, event.minutes);
    month.minutes += minutes;
    if (event.type === "MOVIE") month.movieMinutes += minutes;
    else month.tvMinutes += minutes;
  }

  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    totalDays: Math.round((totalMinutes / 1440) * 100) / 100,
    movieMinutes,
    tvMinutes,
    moviePercent: percent(movieMinutes, totalMinutes),
    tvPercent: percent(tvMinutes, totalMinutes),
    movieLogs: movieEvents.length,
    uniqueMovies,
    episodeCount: tvEvents.length,
    showCount,
    firstWatchedAt,
    lastWatchedAt,
    activeDays,
    averageDailyMinutes,
    longestDay,
    averageRating:
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
        : null,
    longestStreak,
    latestStreak,
    weekday: toBreakdown(weekdayMap, totalMinutes),
    genres: toBreakdown(genreMap, totalMinutes),
    releaseDecades: toBreakdown(decadeMap, totalMinutes).sort(
      (a, b) => Number(a.label.slice(0, 4)) - Number(b.label.slice(0, 4)),
    ),
    calendarYears: toBreakdown(yearMap, totalMinutes).sort(
      (a, b) => Number(a.label) - Number(b.label),
    ),
    months,
    daily,
    topTitles: [...titleMap.values()]
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8),
  };
}
