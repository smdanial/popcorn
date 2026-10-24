"use server";

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidateWatchData } from "@/lib/revalidate";

export type EpisodeResult = {
  ok: boolean;
  watched?: boolean;
  error?: string;
};

async function syncShowStatus(
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
) {
  const [total, watched] = await Promise.all([
    tx.episode.count({ where: { season: { mediaId } } }),
    tx.episodeWatch.count({
      where: { userId, episode: { season: { mediaId } } },
    }),
  ]);

  if (total === 0) return;

  const status = watched >= total ? "WATCHED" : "WATCHING";
  await tx.libraryEntry.upsert({
    where: { userId_mediaId: { userId, mediaId } },
    update: { status },
    create: { userId, mediaId, status },
  });
}

export async function toggleEpisode(episodeId: string): Promise<EpisodeResult> {
  const user = await requireUser();
  const id = z.string().min(1).safeParse(episodeId);
  if (!id.success) return { ok: false, error: "Invalid episode." };

  const episode = await prisma.episode.findUnique({
    where: { id: id.data },
    select: { id: true, season: { select: { mediaId: true } } },
  });
  if (!episode) return { ok: false, error: "Episode not found." };

  const existing = await prisma.episodeWatch.findUnique({
    where: { userId_episodeId: { userId: user.id, episodeId: episode.id } },
  });

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.episodeWatch.delete({ where: { id: existing.id } });
    } else {
      await tx.episodeWatch.create({
        data: { userId: user.id, episodeId: episode.id },
      });
    }
    await syncShowStatus(tx, user.id, episode.season.mediaId);
  });

  revalidateWatchData(episode.season.mediaId);
  return { ok: true, watched: !existing };
}

export async function setSeasonWatched(
  seasonId: string,
  watched: boolean,
): Promise<EpisodeResult> {
  const user = await requireUser();
  const id = z.string().min(1).safeParse(seasonId);
  if (!id.success) return { ok: false, error: "Invalid season." };

  const season = await prisma.season.findUnique({
    where: { id: id.data },
    select: {
      id: true,
      mediaId: true,
      episodes: { select: { id: true } },
    },
  });
  if (!season) return { ok: false, error: "Season not found." };
  if (season.episodes.length === 0) {
    return { ok: false, error: "This season has no episodes yet." };
  }

  await prisma.$transaction(async (tx) => {
    if (watched) {
      for (const episode of season.episodes) {
        await tx.episodeWatch.upsert({
          where: {
            userId_episodeId: { userId: user.id, episodeId: episode.id },
          },
          update: {},
          create: { userId: user.id, episodeId: episode.id },
        });
      }
    } else {
      await tx.episodeWatch.deleteMany({
        where: {
          userId: user.id,
          episodeId: { in: season.episodes.map((episode) => episode.id) },
        },
      });
    }
    await syncShowStatus(tx, user.id, season.mediaId);
  });

  revalidateWatchData(season.mediaId);
  return { ok: true, watched };
}
