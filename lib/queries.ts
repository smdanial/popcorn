import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/stats-data";
import { computeEpisodeProgress } from "@/lib/episode-progress";

export const getDashboardData = cache(async (userId: string) => {
  const [recentDiary, watchlist, watching, lists, stats, episodeWatches] =
    await Promise.all([
      prisma.diaryEntry.findMany({
        where: { userId },
        include: { media: true },
        orderBy: { watchedAt: "desc" },
        take: 10,
      }),
      prisma.libraryEntry.findMany({
        where: { userId, status: "PLAN" },
        include: { media: true },
        orderBy: { addedAt: "desc" },
        take: 12,
      }),
      prisma.libraryEntry.findMany({
        where: { userId, status: "WATCHING", media: { type: "TV" } },
        include: {
          media: {
            include: {
              seasons: { include: { episodes: { select: { id: true, runtime: true } } } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.list.findMany({
        where: { userId },
        include: {
          items: {
            include: { media: true },
            orderBy: { position: "asc" },
            take: 5,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      getUserStats(userId),
      prisma.episodeWatch.findMany({
        where: { userId },
        select: {
          episodeId: true,
          episode: {
            select: {
              runtime: true,
              season: { select: { mediaId: true } },
            },
          },
        },
      }),
    ]);

  const watchesByMedia = new Map<string, Set<string>>();
  for (const watch of episodeWatches) {
    const mediaId = watch.episode.season.mediaId;
    const set = watchesByMedia.get(mediaId) ?? new Set<string>();
    set.add(watch.episodeId);
    watchesByMedia.set(mediaId, set);
  }

  const continueWatching = watching.map((entry) => {
    const watched = watchesByMedia.get(entry.mediaId) ?? new Set<string>();
    const progress = computeEpisodeProgress(entry.media.seasons, watched);
    return { entry, progress };
  });

  return {
    recentDiary,
    watchlist,
    continueWatching,
    lists,
    stats,
  };
});

export const getMediaDetail = cache(async (mediaId: string, userId: string) => {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      genres: { include: { genre: true } },
      seasons: {
        include: { episodes: { orderBy: { episodeNumber: "asc" } } },
        orderBy: { seasonNumber: "asc" },
      },
      libraryEntries: { where: { userId }, take: 1 },
      diaryEntries: {
        where: { userId },
        orderBy: { watchedAt: "desc" },
        take: 8,
      },
      listItems: {
        where: { list: { userId } },
        include: { list: { select: { id: true, title: true } } },
      },
    },
  });

  if (!media) return null;

  const [episodeWatches, userLists, similar] = await Promise.all([
    media.type === "TV"
      ? prisma.episodeWatch.findMany({
          where: { userId, episode: { season: { mediaId } } },
          select: { episodeId: true, watchedAt: true },
          orderBy: { watchedAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.list.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        items: { where: { mediaId }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.media.findMany({
      where: {
        id: { not: mediaId },
        type: media.type,
        genres: {
          some: {
            genreId: { in: media.genres.map((item) => item.genreId) },
          },
        },
      },
      orderBy: [{ voteAverage: "desc" }],
      take: 6,
    }),
  ]);

  return {
    media,
    libraryEntry: media.libraryEntries[0] ?? null,
    episodeWatches,
    lists: userLists,
    similar,
  };
});
