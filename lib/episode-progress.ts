import { DEFAULT_EPISODE_RUNTIME } from "@/lib/constants";

type ProgressEpisode = { id: string; runtime: number | null };
type ProgressSeason = { episodes: ProgressEpisode[] };

export function computeEpisodeProgress(
  seasons: ProgressSeason[],
  watchedIds: Iterable<string>,
) {
  const watched = new Set(watchedIds);
  let totalEpisodes = 0;
  let watchedEpisodes = 0;
  let totalMinutes = 0;
  let watchedMinutes = 0;

  for (const season of seasons) {
    for (const episode of season.episodes) {
      const minutes = episode.runtime ?? DEFAULT_EPISODE_RUNTIME;
      totalEpisodes += 1;
      totalMinutes += minutes;
      if (watched.has(episode.id)) {
        watchedEpisodes += 1;
        watchedMinutes += minutes;
      }
    }
  }

  return {
    totalEpisodes,
    watchedEpisodes,
    totalMinutes,
    watchedMinutes,
    percent:
      totalEpisodes === 0 ? 0 : Math.round((watchedEpisodes / totalEpisodes) * 100),
  };
}
