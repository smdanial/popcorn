import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { MediaType } from "@/lib/constants";
import {
  getTmdbMovie,
  getTmdbSeason,
  getTmdbTv,
  tmdbImage,
  type TmdbGenre,
} from "@/lib/tmdb";
import { safeParseDate } from "@/lib/utils";

async function ensureGenres(genres: TmdbGenre[]) {
  return Promise.all(
    genres.map((genre) =>
      prisma.genre.upsert({
        where: { name: genre.name },
        update: {},
        create: { name: genre.name },
      }),
    ),
  );
}

export async function importMediaFromTmdb(tmdbId: number, type: MediaType) {
  const existing = await prisma.media.findFirst({ where: { tmdbId, type } });
  if (existing) return existing.id;

  if (type === "MOVIE") {
    const movie = await getTmdbMovie(tmdbId);
    const genres = await ensureGenres(movie.genres);

    const media = await prisma.media.create({
      data: {
        tmdbId,
        type: "MOVIE",
        title: movie.title,
        originalTitle: movie.original_title,
        overview: movie.overview ?? "",
        tagline: movie.tagline,
        posterPath: tmdbImage(movie.poster_path, "w500"),
        backdropPath: tmdbImage(movie.backdrop_path, "w1280"),
        releaseDate: safeParseDate(movie.release_date),
        runtime: movie.runtime,
        voteAverage: movie.vote_average,
        genres: { create: genres.map((genre) => ({ genreId: genre.id })) },
      },
    });

    return media.id;
  }

  const show = await getTmdbTv(tmdbId);
  const genres = await ensureGenres(show.genres);
  const fallbackRuntime = show.episode_run_time?.[0] ?? null;
  const seasonsToFetch = show.seasons
    .filter((season) => season.season_number > 0 && season.episode_count > 0)
    .slice(0, 30);

  const seasons: Prisma.SeasonCreateWithoutMediaInput[] = [];
  for (const summary of seasonsToFetch) {
    const details = await getTmdbSeason(tmdbId, summary.season_number);
    seasons.push({
      seasonNumber: summary.season_number,
      name: summary.name || `Season ${summary.season_number}`,
      overview: summary.overview ?? "",
      posterPath: tmdbImage(summary.poster_path, "w500"),
      airDate: safeParseDate(summary.air_date),
      episodeCount: details.episodes.length,
      episodes: {
        create: details.episodes
          .filter((episode) => episode.episode_number > 0)
          .map((episode) => ({
            episodeNumber: episode.episode_number,
            name: episode.name || `Episode ${episode.episode_number}`,
            overview: episode.overview ?? "",
            runtime: episode.runtime ?? fallbackRuntime,
            stillPath: tmdbImage(episode.still_path, "w300"),
            airDate: safeParseDate(episode.air_date),
          })),
      },
    });
  }

  const media = await prisma.media.create({
    data: {
      tmdbId,
      type: "TV",
      title: show.name,
      originalTitle: show.original_name,
      overview: show.overview ?? "",
      tagline: show.tagline,
      posterPath: tmdbImage(show.poster_path, "w500"),
      backdropPath: tmdbImage(show.backdrop_path, "w1280"),
      releaseDate: safeParseDate(show.first_air_date),
      voteAverage: show.vote_average,
      genres: { create: genres.map((genre) => ({ genreId: genre.id })) },
      seasons: { create: seasons },
    },
  });

  return media.id;
}
