export type TmdbMediaType = "movie" | "tv";

export class TmdbNotConfiguredError extends Error {
  constructor() {
    super(
      "TMDB is not configured. Add TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN to your .env file.",
    );
    this.name = "TmdbNotConfiguredError";
  }
}

export class TmdbError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

export type TmdbGenre = { id: number; name: string };

export type TmdbMovieDetails = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  genres: TmdbGenre[];
};

export type TmdbSeasonSummary = {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number;
};

export type TmdbTvDetails = {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  episode_run_time: number[];
  genres: TmdbGenre[];
  seasons: TmdbSeasonSummary[];
};

export type TmdbEpisode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  runtime: number | null;
  still_path: string | null;
  air_date: string | null;
};

export type TmdbSeasonDetails = {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  episodes: TmdbEpisode[];
};

export type TmdbSearchResult = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

const TMDB_BASE = "https://api.themoviedb.org/3";

export function isTmdbConfigured() {
  return Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_ACCESS_TOKEN);
}

export function tmdbImage(path: string | null | undefined, size = "w500") {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/posters") || path.startsWith("/backdrops")) {
    return path;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function tmdbYear(value: string | null | undefined) {
  if (!value) return null;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : null;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  revalidate = 3600,
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!apiKey && !token) throw new TmdbNotConfiguredError();

  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  if (!token && apiKey) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const message =
      response.status === 401
        ? "TMDB rejected the API key. Check TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN."
        : `TMDB request failed (${response.status}). Try again in a moment.`;
    throw new TmdbError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function searchTmdb(query: string) {
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>("/search/multi", {
    query,
    include_adult: false,
    language: "en-US",
    page: 1,
  });
  return data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv",
  );
}

export async function trendingTmdb() {
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>("/trending/all/week", {
    language: "en-US",
  });
  return data.results.filter(
    (result) =>
      (result.media_type === "movie" || result.media_type === "tv") &&
      Boolean(result.poster_path),
  );
}

export async function getTmdbMovie(id: number) {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, { language: "en-US" });
}

export async function getTmdbTv(id: number) {
  return tmdbFetch<TmdbTvDetails>(`/tv/${id}`, { language: "en-US" });
}

export async function getTmdbSeason(tvId: number, seasonNumber: number) {
  return tmdbFetch<TmdbSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, {
    language: "en-US",
  });
}
