import { describe, expect, it } from "vitest";
import { buildLifetimeStats, type WatchEvent } from "./stats";
import { computeEpisodeProgress } from "./episode-progress";

const now = new Date("2026-01-11T12:00:00.000Z");

function event(overrides: Partial<WatchEvent>): WatchEvent {
  return {
    id: overrides.id ?? "event",
    mediaId: overrides.mediaId ?? "media",
    title: overrides.title ?? "Title",
    posterPath: null,
    type: overrides.type ?? "MOVIE",
    minutes: overrides.minutes ?? 100,
    watchedAt: overrides.watchedAt ?? new Date("2026-01-01T20:00:00.000Z"),
    genres: overrides.genres ?? ["Drama"],
    releaseYear: overrides.releaseYear ?? 2020,
    rating: overrides.rating ?? null,
  };
}

describe("buildLifetimeStats", () => {
  it("returns an empty, safe shape without events", () => {
    const stats = buildLifetimeStats([], now);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.averageDailyMinutes).toBe(0);
    expect(stats.genres).toEqual([]);
    expect(stats.months).toHaveLength(12);
    expect(stats.topTitles).toEqual([]);
  });

  it("splits film and television time correctly", () => {
    const events = [
      event({ id: "a", mediaId: "film-1", type: "MOVIE", minutes: 120, rating: 4 }),
      event({
        id: "b",
        mediaId: "show-1",
        title: "Show",
        type: "TV",
        minutes: 50,
        watchedAt: new Date("2026-01-05T20:00:00.000Z"),
      }),
      event({
        id: "c",
        mediaId: "show-1",
        title: "Show",
        type: "TV",
        minutes: 55,
        watchedAt: new Date("2026-01-06T20:00:00.000Z"),
      }),
    ];

    const stats = buildLifetimeStats(events, now);
    expect(stats.totalMinutes).toBe(225);
    expect(stats.movieMinutes).toBe(120);
    expect(stats.tvMinutes).toBe(105);
    expect(stats.moviePercent).toBeCloseTo(53.3, 1);
    expect(stats.episodeCount).toBe(2);
    expect(stats.showCount).toBe(1);
    expect(stats.movieLogs).toBe(1);
    expect(stats.averageRating).toBe(4);
  });

  it("calculates a lifetime average across the full day span", () => {
    const stats = buildLifetimeStats([event({ minutes: 200 })], now);
    expect(stats.activeDays).toBe(1);
    expect(stats.averageDailyMinutes).toBe(18);
  });

  it("aggregates genres, years, decades, and top titles", () => {
    const events = [
      event({
        id: "a",
        mediaId: "film-1",
        title: "Film One",
        minutes: 100,
        genres: ["Sci-Fi", "Drama"],
        releaseYear: 2014,
      }),
      event({
        id: "b",
        mediaId: "film-2",
        title: "Film Two",
        minutes: 150,
        genres: ["Sci-Fi"],
        releaseYear: 1984,
        watchedAt: new Date("2026-01-02T20:00:00.000Z"),
      }),
      event({
        id: "c",
        mediaId: "film-2",
        title: "Film Two",
        minutes: 150,
        genres: ["Sci-Fi"],
        releaseYear: 1984,
        watchedAt: new Date("2026-01-03T20:00:00.000Z"),
      }),
    ];

    const stats = buildLifetimeStats(events, now);
    expect(stats.genres[0]).toMatchObject({ label: "Sci-Fi", minutes: 400 });
    expect(stats.releaseDecades.map((item) => item.label)).toEqual(["1980s", "2010s"]);
    expect(stats.calendarYears[0]).toMatchObject({ label: "2026", minutes: 400 });
    expect(stats.topTitles[0]).toMatchObject({
      title: "Film Two",
      minutes: 300,
      count: 2,
    });
  });

  it("tracks the longest day and the last 12 months", () => {
    const events = [
      event({
        id: "a",
        minutes: 60,
        watchedAt: new Date("2026-01-05T20:00:00.000Z"),
      }),
      event({
        id: "b",
        minutes: 120,
        watchedAt: new Date("2026-01-05T22:00:00.000Z"),
      }),
    ];

    const stats = buildLifetimeStats(events, now);
    expect(stats.longestDay?.minutes).toBe(180);
    expect(stats.months).toHaveLength(12);
    expect(stats.months.at(-1)?.key).toBe("2026-01");
    expect(stats.months.at(-1)?.minutes).toBe(180);
  });
});

describe("computeEpisodeProgress", () => {
  it("sums runtimes for watched and unwatched episodes", () => {
    const seasons = [
      {
        episodes: [
          { id: "e1", runtime: 50 },
          { id: "e2", runtime: 40 },
          { id: "e3", runtime: null },
        ],
      },
    ];

    const progress = computeEpisodeProgress(seasons, ["e1", "e3"]);
    expect(progress.totalEpisodes).toBe(3);
    expect(progress.watchedEpisodes).toBe(2);
    expect(progress.totalMinutes).toBe(135);
    expect(progress.watchedMinutes).toBe(95);
    expect(progress.percent).toBe(67);
  });

  it("handles an empty series", () => {
    expect(computeEpisodeProgress([], [])).toEqual({
      totalEpisodes: 0,
      watchedEpisodes: 0,
      totalMinutes: 0,
      watchedMinutes: 0,
      percent: 0,
    });
  });
});
