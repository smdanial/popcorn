import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmdbTv, getTmdbSeason, tmdbImage, isTmdbConfigured } from "@/lib/tmdb";
import { safeParseDate } from "@/lib/utils";

export const revalidate = 86400;

export async function GET() {
  if (!isTmdbConfigured()) {
    return NextResponse.json({ error: "TMDB not configured" }, { status: 503 });
  }

  try {
    const tvShows = await prisma.media.findMany({
      where: {
        type: "TV",
        tmdbId: { not: null },
        OR: [
          { libraryEntries: { some: {} } },
          { diaryEntries: { some: {} } },
        ],
      },
      include: {
        seasons: {
          include: {
            episodes: {
              select: { id: true, episodeNumber: true, runtime: true },
            },
          },
        },
      },
    });

    let updatedShows = 0;
    let updatedEpisodes = 0;
    let addedEpisodes = 0;
    let addedSeasons = 0;

    for (const show of tvShows) {
      const tmdbId = show.tmdbId!;
      const tmdbShow = await getTmdbTv(tmdbId);

      if (tmdbShow.vote_average !== show.voteAverage) {
        await prisma.media.update({
          where: { id: show.id },
          data: { voteAverage: tmdbShow.vote_average },
        });
      }

      const existingSeasonNumbers = new Set(show.seasons.map((s) => s.seasonNumber));
      const existingEpisodeKeys = new Set(
        show.seasons.flatMap((season) =>
          season.episodes.map((ep) => `${season.id}:${ep.episodeNumber}`),
        ),
      );

      const seasonsToProcess = tmdbShow.seasons
        .filter(
          (season) =>
            season.season_number > 0 &&
            season.episode_count > 0 &&
            !existingSeasonNumbers.has(season.season_number),
        )
        .slice(0, 30);

      for (const summary of seasonsToProcess) {
        const details = await getTmdbSeason(tmdbId, summary.season_number);

        const episodeCount = details.episodes.filter((ep) => ep.episode_number > 0).length;
        await prisma.season.create({
          data: {
            mediaId: show.id,
            seasonNumber: summary.season_number,
            name: summary.name || `Season ${summary.season_number}`,
            overview: summary.overview ?? "",
            posterPath: tmdbImage(summary.poster_path, "w500"),
            airDate: safeParseDate(summary.air_date),
            episodeCount,
            episodes: {
              create: details.episodes
                .filter((ep) => ep.episode_number > 0)
                .map((ep) => ({
                  episodeNumber: ep.episode_number,
                  name: ep.name || `Episode ${ep.episode_number}`,
                  overview: ep.overview ?? "",
                  runtime: ep.runtime,
                  stillPath: tmdbImage(ep.still_path, "w300"),
                  airDate: safeParseDate(ep.air_date),
                })),
            },
          },
        });

        addedSeasons += 1;
        addedEpisodes += episodeCount;
      }

      const fallbackRuntime = tmdbShow.episode_run_time?.[0] ?? null;

      for (const summary of tmdbShow.seasons.filter((s) => s.season_number > 0)) {
        if (!existingSeasonNumbers.has(summary.season_number)) continue;

        const localSeason = show.seasons.find((s) => s.seasonNumber === summary.season_number);
        if (!localSeason) continue;

        const details = await getTmdbSeason(tmdbId, summary.season_number);

        for (const episode of details.episodes.filter((ep) => ep.episode_number > 0)) {
          const episodeKey = `${localSeason.id}:${episode.episode_number}`;
          if (!existingEpisodeKeys.has(episodeKey)) {
            await prisma.episode.create({
              data: {
                seasonId: localSeason.id,
                episodeNumber: episode.episode_number,
                name: episode.name || `Episode ${episode.episode_number}`,
                overview: episode.overview ?? "",
                runtime: episode.runtime ?? fallbackRuntime,
                stillPath: tmdbImage(episode.still_path, "w300"),
                airDate: safeParseDate(episode.air_date),
              },
            });
            addedEpisodes += 1;
            existingEpisodeKeys.add(episodeKey);
          } else {
            const localEpisode = localSeason.episodes.find(
              (ep) => ep.episodeNumber === episode.episode_number,
            );
            if (localEpisode && episode.runtime !== null && episode.runtime !== localEpisode.runtime) {
              await prisma.episode.update({
                where: { id: localEpisode.id },
                data: { runtime: episode.runtime },
              });
              updatedEpisodes += 1;
            }
          }
        }

        if (localSeason.episodes.length !== details.episodes.length) {
          await prisma.season.update({
            where: { id: localSeason.id },
            data: { episodeCount: details.episodes.length },
          });
        }
      }

      updatedShows += 1;
    }

    return NextResponse.json({
      success: true,
      updatedShows,
      updatedEpisodes,
      addedEpisodes,
      addedSeasons,
    });
  } catch (error) {
    console.error("Daily sync failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}