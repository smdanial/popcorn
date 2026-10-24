import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_EPISODE_RUNTIME } from "@/lib/constants";
import { buildLifetimeStats, type WatchEvent } from "@/lib/stats";

export const getUserWatchEvents = cache(async (userId: string): Promise<WatchEvent[]> => {
  const [diaryEntries, episodeWatches] = await Promise.all([
    prisma.diaryEntry.findMany({
      where: { userId, media: { type: "MOVIE" } },
      include: {
        media: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
      orderBy: { watchedAt: "asc" },
    }),
    prisma.episodeWatch.findMany({
      where: { userId },
      include: {
        episode: {
          include: {
            season: {
              include: {
                media: {
                  include: {
                    genres: { include: { genre: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { watchedAt: "asc" },
    }),
  ]);

  const movieEvents: WatchEvent[] = diaryEntries.map((entry) => ({
    id: `diary-${entry.id}`,
    mediaId: entry.mediaId,
    title: entry.media.title,
    posterPath: entry.media.posterPath,
    type: "MOVIE",
    minutes: entry.media.runtime ?? 0,
    watchedAt: entry.watchedAt,
    genres: entry.media.genres.map((item) => item.genre.name),
    releaseYear: entry.media.releaseDate?.getUTCFullYear() ?? null,
    rating: entry.rating,
  }));

  const showEvents: WatchEvent[] = episodeWatches.map((watch) => {
    const media = watch.episode.season.media;
    return {
      id: `episode-${watch.id}`,
      mediaId: media.id,
      title: media.title,
      posterPath: media.posterPath,
      type: "TV",
      minutes: watch.episode.runtime ?? DEFAULT_EPISODE_RUNTIME,
      watchedAt: watch.watchedAt,
      genres: media.genres.map((item) => item.genre.name),
      releaseYear: media.releaseDate?.getUTCFullYear() ?? null,
      rating: null,
    };
  });

  return [...movieEvents, ...showEvents];
});

export const getUserStats = cache(async (userId: string) =>
  buildLifetimeStats(await getUserWatchEvents(userId)),
);
