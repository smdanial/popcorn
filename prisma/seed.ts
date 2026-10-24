import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@popcorn.app";
const DEMO_PASSWORD = "popcorn";

const NOW = new Date();

function daysAgo(days: number, hour = 20) {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

type EpisodeSeed = { name: string; runtime: number };

type SeasonSeed = {
  number: number;
  name: string;
  overview: string;
  airDate: string;
  episodes: EpisodeSeed[];
};

type MovieSeed = {
  slug: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  tagline: string;
  releaseDate: string;
  runtime: number;
  voteAverage: number;
  genres: string[];
};

type ShowSeed = {
  slug: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  tagline: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
  seasons: SeasonSeed[];
};

const movies: MovieSeed[] = [
  {
    slug: "blade-runner-2049",
    tmdbId: 335984,
    title: "Blade Runner 2049",
    originalTitle: "Blade Runner 2049",
    overview:
      "Thirty years after the events of the first film, a new blade runner unearths a long-buried secret that has the potential to plunge what is left of society into chaos.",
    tagline: "There is an order to things.",
    releaseDate: "2017-10-04",
    runtime: 164,
    voteAverage: 7.6,
    genres: ["Sci-Fi", "Drama", "Mystery"],
  },
  {
    slug: "dune-part-two",
    tmdbId: 693134,
    title: "Dune: Part Two",
    originalTitle: "Dune: Part Two",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    tagline: "Long live the fighters.",
    releaseDate: "2024-02-27",
    runtime: 166,
    voteAverage: 8.1,
    genres: ["Sci-Fi", "Adventure", "Drama"],
  },
  {
    slug: "arrival",
    tmdbId: 329865,
    title: "Arrival",
    originalTitle: "Arrival",
    overview:
      "A linguist is recruited by the military to communicate with alien lifeforms after twelve mysterious spacecraft land around the world.",
    tagline: "Why are they here?",
    releaseDate: "2016-11-10",
    runtime: 116,
    voteAverage: 7.6,
    genres: ["Sci-Fi", "Drama", "Mystery"],
  },
  {
    slug: "whiplash",
    tmdbId: 244786,
    title: "Whiplash",
    originalTitle: "Whiplash",
    overview:
      "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    tagline: "The road to greatness can take you to the edge.",
    releaseDate: "2014-10-10",
    runtime: 106,
    voteAverage: 8.4,
    genres: ["Drama", "Music"],
  },
  {
    slug: "everything-everywhere",
    tmdbId: 545611,
    title: "Everything Everywhere All at Once",
    originalTitle: "Everything Everywhere All at Once",
    overview:
      "An ordinary woman discovers she must connect with parallel-universe versions of herself to prevent a powerful being from destroying the multiverse.",
    tagline: "The universe is so much bigger than you realize.",
    releaseDate: "2022-03-24",
    runtime: 139,
    voteAverage: 7.8,
    genres: ["Sci-Fi", "Comedy", "Adventure"],
  },
  {
    slug: "parasite",
    tmdbId: 496243,
    title: "Parasite",
    originalTitle: "기생충",
    overview:
      "The struggling Kim family infiltrates the wealthy Park household, and the arrangement spirals into a razor-sharp study of class, appetite, and survival.",
    tagline: "Act like you own the place.",
    releaseDate: "2019-05-30",
    runtime: 132,
    voteAverage: 8.5,
    genres: ["Thriller", "Drama", "Comedy"],
  },
  {
    slug: "her",
    tmdbId: 152601,
    title: "Her",
    originalTitle: "Her",
    overview:
      "A lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
    tagline: "A story about anyone who's ever been in love.",
    releaseDate: "2013-12-18",
    runtime: 126,
    voteAverage: 8.0,
    genres: ["Romance", "Sci-Fi", "Drama"],
  },
  {
    slug: "the-batman",
    tmdbId: 414906,
    title: "The Batman",
    originalTitle: "The Batman",
    overview:
      "Two years of stalking the streets as the Batman have driven Bruce Wayne deep into the shadows of Gotham City, until a sadistic killer leaves behind a trail of cryptic clues.",
    tagline: "Unmask the truth.",
    releaseDate: "2022-03-01",
    runtime: 176,
    voteAverage: 7.7,
    genres: ["Crime", "Mystery", "Thriller"],
  },
  {
    slug: "sicario",
    tmdbId: 273481,
    title: "Sicario",
    originalTitle: "Sicario",
    overview:
      "An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs at the border area between the U.S. and Mexico.",
    tagline: "The border is just another line to cross.",
    releaseDate: "2015-09-17",
    runtime: 121,
    voteAverage: 7.4,
    genres: ["Thriller", "Crime", "Drama"],
  },
  {
    slug: "mad-max-fury-road",
    tmdbId: 76341,
    title: "Mad Max: Fury Road",
    originalTitle: "Mad Max: Fury Road",
    overview:
      "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland with the help of a group of female prisoners and a drifter named Max.",
    tagline: "What a lovely day.",
    releaseDate: "2015-05-15",
    runtime: 120,
    voteAverage: 7.6,
    genres: ["Action", "Adventure", "Sci-Fi"],
  },
  {
    slug: "poor-things",
    tmdbId: 792307,
    title: "Poor Things",
    originalTitle: "Poor Things",
    overview:
      "Brought back to life by an unorthodox scientist, young Bella Baxter runs off on a whirlwind adventure across continents in search of the worldliness she is lacking.",
    tagline: "She's like nothing you've ever seen.",
    releaseDate: "2023-12-08",
    runtime: 141,
    voteAverage: 7.7,
    genres: ["Comedy", "Romance", "Sci-Fi"],
  },
  {
    slug: "past-lives",
    tmdbId: 666277,
    title: "Past Lives",
    originalTitle: "Past Lives",
    overview:
      "Two deeply connected childhood friends are wrest apart after Nora's family emigrates from South Korea. Decades later, they are reunited for one fateful week.",
    tagline: "First love never really leaves.",
    releaseDate: "2023-06-02",
    runtime: 105,
    voteAverage: 7.8,
    genres: ["Romance", "Drama"],
  },
  {
    slug: "the-substance",
    tmdbId: 933260,
    title: "The Substance",
    originalTitle: "The Substance",
    overview:
      "A fading celebrity decides to use a black-market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
    tagline: "Have you ever dreamt of a better version of yourself?",
    releaseDate: "2024-09-20",
    runtime: 141,
    voteAverage: 7.1,
    genres: ["Horror", "Sci-Fi", "Drama"],
  },
  {
    slug: "perfect-days",
    tmdbId: 976893,
    title: "Perfect Days",
    originalTitle: "Perfect Days",
    overview:
      "A quiet toilet cleaner in Tokyo finds beauty in the small rituals of his daily routine, until a series of encounters gently disrupts his carefully ordered life.",
    tagline: "Next time is next time. Now is now.",
    releaseDate: "2023-12-22",
    runtime: 124,
    voteAverage: 7.6,
    genres: ["Drama"],
  },
];

const shows: ShowSeed[] = [
  {
    slug: "severance",
    tmdbId: 95396,
    title: "Severance",
    originalTitle: "Severance",
    overview:
      "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    tagline: "Who are you at work?",
    releaseDate: "2022-02-18",
    voteAverage: 8.4,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "The severance procedure begins to crack at the seams.",
        airDate: "2022-02-18",
        episodes: [
          { name: "Good News About Hell", runtime: 57 },
          { name: "Half Loop", runtime: 53 },
          { name: "In Perpetuity", runtime: 56 },
          { name: "The You You Are", runtime: 48 },
          { name: "The Grim Barbarity of Optics and Design", runtime: 47 },
          { name: "Hide and Seek", runtime: 46 },
          { name: "Defiant Jazz", runtime: 48 },
          { name: "What's for Dinner?", runtime: 49 },
          { name: "The We We Are", runtime: 50 },
        ],
      },
    ],
  },
  {
    slug: "mr-robot",
    tmdbId: 62560,
    title: "Mr. Robot",
    originalTitle: "Mr. Robot",
    overview:
      "Elliot, a brilliant but highly unstable young cyber-security engineer and vigilante hacker, is recruited by a mysterious leader of an underground hacker group to destroy the company he is paid to protect.",
    tagline: "Our democracy has been hacked.",
    releaseDate: "2015-06-24",
    voteAverage: 8.2,
    genres: ["Drama", "Thriller", "Crime"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "Elliot is pulled into fsociety's plan to erase the world's debt.",
        airDate: "2015-06-24",
        episodes: [
          { name: "eps1.0_hellofriend.mov", runtime: 65 },
          { name: "eps1.1_ones-and-zer0es.mpeg", runtime: 49 },
          { name: "eps1.2_d3bug.mkv", runtime: 45 },
          { name: "eps1.3_da3m0ns.mp4", runtime: 46 },
          { name: "eps1.4_3xpl0its.wmv", runtime: 47 },
          { name: "eps1.5_br4ve-trave1er.asf", runtime: 46 },
          { name: "eps1.6_v1ew-s0urce.flv", runtime: 45 },
          { name: "eps1.7_wh1ter0se.m4v", runtime: 46 },
          { name: "eps1.8_m1rr0r1ng.qt", runtime: 52 },
          { name: "eps1.9_zer0-day.avi", runtime: 54 },
        ],
      },
    ],
  },
  {
    slug: "dark",
    tmdbId: 70523,
    title: "Dark",
    originalTitle: "Dark",
    overview:
      "A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations in a small German town.",
    tagline: "The end is the beginning.",
    releaseDate: "2017-12-01",
    voteAverage: 8.4,
    genres: ["Sci-Fi", "Mystery", "Drama"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "A disappearance in Winden opens a door through time.",
        airDate: "2017-12-01",
        episodes: [
          { name: "Secrets", runtime: 51 },
          { name: "Lies", runtime: 45 },
          { name: "Past and Present", runtime: 58 },
          { name: "Double Lives", runtime: 47 },
          { name: "Truths", runtime: 51 },
          { name: "Sic Mundus Creatus Est", runtime: 60 },
          { name: "Crossroads", runtime: 52 },
          { name: "As You Sow, so You Shall Reap", runtime: 56 },
          { name: "Everything Is Now", runtime: 58 },
          { name: "Alpha and Omega", runtime: 60 },
        ],
      },
    ],
  },
  {
    slug: "the-bear",
    tmdbId: 136315,
    title: "The Bear",
    originalTitle: "The Bear",
    overview:
      "A young chef from the fine-dining world comes home to Chicago to run his family's sandwich shop after a heartbreaking death.",
    tagline: "Every second counts.",
    releaseDate: "2022-06-23",
    voteAverage: 8.3,
    genres: ["Drama", "Comedy"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "Carmy tries to turn The Original Beef into something new.",
        airDate: "2022-06-23",
        episodes: [
          { name: "System", runtime: 27 },
          { name: "Hands", runtime: 30 },
          { name: "Brigade", runtime: 28 },
          { name: "Dogs", runtime: 26 },
          { name: "Sheridan", runtime: 25 },
          { name: "Ceres", runtime: 24 },
          { name: "Review", runtime: 23 },
          { name: "Braciole", runtime: 31 },
        ],
      },
    ],
  },
  {
    slug: "cyberpunk-edgerunners",
    tmdbId: 105248,
    title: "Cyberpunk: Edgerunners",
    originalTitle: "Cyberpunk: Edgerunners",
    overview:
      "A street kid tries to survive in a technology and body modification-obsessed city of the future, having lost everything and choosing to become an edgerunner: a mercenary outlaw.",
    tagline: "Let's dance with death.",
    releaseDate: "2022-09-13",
    voteAverage: 8.6,
    genres: ["Animation", "Sci-Fi", "Action"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "Night City eats its dreamers, but David refuses to stop running.",
        airDate: "2022-09-13",
        episodes: [
          { name: "Let You Down", runtime: 24 },
          { name: "Like a Boy", runtime: 23 },
          { name: "Smooth Criminal", runtime: 24 },
          { name: "Girl on Fire", runtime: 23 },
          { name: "All Eyez on Me", runtime: 24 },
          { name: "Girl on Fire", runtime: 23 },
          { name: "Stronger", runtime: 24 },
          { name: "Rebel Rebel", runtime: 24 },
          { name: "My Moon My Man", runtime: 23 },
          { name: "An Ending", runtime: 25 },
        ],
      },
    ],
  },
  {
    slug: "andor",
    tmdbId: 83867,
    title: "Andor",
    originalTitle: "Andor",
    overview:
      "Cassian Andor's journey to discover the difference he can make in a galaxy under the tightening grip of the Empire becomes an unlikely path toward rebellion.",
    tagline: "A rebellion is built one choice at a time.",
    releaseDate: "2022-09-21",
    voteAverage: 8.2,
    genres: ["Sci-Fi", "Drama", "Thriller"],
    seasons: [
      {
        number: 1,
        name: "Season 1",
        overview: "The sparks of rebellion are scattered across the galaxy.",
        airDate: "2022-09-21",
        episodes: [
          { name: "Kassa", runtime: 41 },
          { name: "That Would Be Me", runtime: 42 },
          { name: "Reckoning", runtime: 45 },
          { name: "Aldhani", runtime: 49 },
          { name: "The Axe Forgets", runtime: 45 },
          { name: "The Eye", runtime: 51 },
          { name: "Announcement", runtime: 49 },
          { name: "Narkina 5", runtime: 47 },
          { name: "Nobody's Listening!", runtime: 46 },
          { name: "One Way Out", runtime: 50 },
          { name: "Daughter of Ferrix", runtime: 46 },
          { name: "Rix Road", runtime: 55 },
        ],
      },
    ],
  },
];

const diaryPlan = [
  { slug: "arrival", days: 540, rating: 4 },
  { slug: "whiplash", days: 530, rating: 4 },
  { slug: "blade-runner-2049", days: 525, rating: 4.5 },
  { slug: "parasite", days: 510, rating: 4 },
  { slug: "dune-part-two", days: 500, rating: 4.5 },
  { slug: "arrival", days: 480, rating: 4.5 },
  { slug: "whiplash", days: 460, rating: 4.5 },
  { slug: "everything-everywhere", days: 440, rating: 4.5 },
  { slug: "her", days: 420, rating: 4 },
  { slug: "parasite", days: 390, rating: 4.5 },
  { slug: "everything-everywhere", days: 350, rating: 4.5 },
  { slug: "sicario", days: 340, rating: 4 },
  { slug: "blade-runner-2049", days: 310, rating: 5 },
  { slug: "mad-max-fury-road", days: 300, rating: 4 },
  { slug: "the-batman", days: 260, rating: 3.5 },
  { slug: "arrival", days: 225, rating: 5 },
  { slug: "parasite", days: 180, rating: 4.5 },
  { slug: "dune-part-two", days: 150, rating: 5 },
  { slug: "whiplash", days: 120, rating: 5 },
  { slug: "her", days: 90, rating: 4.5 },
  { slug: "mad-max-fury-road", days: 77, rating: 4.5 },
  { slug: "arrival", days: 64, rating: 4.5 },
  { slug: "whiplash", days: 58, rating: 5 },
  { slug: "everything-everywhere", days: 44, rating: 5 },
  { slug: "blade-runner-2049", days: 36, rating: 5 },
  { slug: "everything-everywhere", days: 33, rating: 5 },
  { slug: "parasite", days: 28, rating: 4.5 },
  { slug: "the-batman", days: 22, rating: 4 },
  { slug: "dune-part-two", days: 12, rating: 4.5 },
];

const reviews: Record<string, string> = {
  "blade-runner-2049": "Every frame is a painting and every silence lasts a lifetime. The best kind of sequel: it expands the question instead of answering it.",
  arrival: "A film about language, grief, and choosing to love something you know you will lose. The reveal lands like a held breath finally released.",
  whiplash: "Not a film about music. A film about the terrible cost of being exceptional, and how abuse can masquerade as mentorship.",
  parasite: "A perfect pressure cooker of a movie. The staircase is the whole thesis; every step up costs someone below.",
  "dune-part-two": "Sand, scale, and destiny. The spectacle is enormous, but the tragedy is intimate.",
  her: "Warm, lonely, and somehow more prophetic every year. The quietest science fiction film about being human.",
  "everything-everywhere": "An absurd multiverse used as a pressure valve for generational grief. I laughed until I cried, then cried until I laughed.",
  "mad-max-fury-road": "Pure kinetic storytelling. Every cut, every engine roar, every glance is doing three jobs at once.",
  "the-batman": "A rain-soaked noir that finally treats the detective part of the character as the point, not the setup.",
  sicario: "Dread as architecture. The border crossing scene is one of the great suspense sequences of the decade.",
};

const watchPlans = [
  { slug: "dark", endDaysAgo: 380, spacing: 3, count: "all" as const },
  { slug: "mr-robot", endDaysAgo: 300, spacing: 4, count: "all" as const },
  { slug: "severance", endDaysAgo: 170, spacing: 4, count: "all" as const },
  { slug: "cyberpunk-edgerunners", endDaysAgo: 120, spacing: 2, count: "all" as const },
  { slug: "the-bear", endDaysAgo: 42, spacing: 6, count: 5 },
  { slug: "andor", endDaysAgo: 20, spacing: 5, count: 4 },
];

const showRatings: Record<string, number> = {
  severance: 5,
  "mr-robot": 4.5,
  dark: 4.5,
  "the-bear": 4.5,
  "cyberpunk-edgerunners": 4,
  andor: 4,
};

const favoriteShows = new Set(["severance", "mr-robot", "the-bear"]);

const watchlist = [
  { slug: "poor-things", days: 3 },
  { slug: "past-lives", days: 5 },
  { slug: "the-substance", days: 8 },
  { slug: "perfect-days", days: 11 },
];

async function main() {
  const genreNames = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Drama",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });
  await prisma.media.deleteMany({
    where: {
      tmdbId: {
        in: [...movies, ...shows].map((item) => item.tmdbId),
      },
    },
  });

  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );
  const genreByName = new Map(genres.map((genre) => [genre.name, genre]));

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Alex Mercer",
      passwordHash: await hash(DEMO_PASSWORD, 10),
      avatarColor: "#f7c948",
    },
  });

  const mediaBySlug = new Map<
    string,
    {
      id: string;
      type: string;
      runtime: number | null;
      seasons: Array<{
        seasonNumber: number;
        episodes: Array<{ id: string; episodeNumber: number; runtime: number | null }>;
      }>;
    }
  >();

  for (const movie of movies) {
    const created = await prisma.media.create({
      data: {
        tmdbId: movie.tmdbId,
        type: "MOVIE",
        title: movie.title,
        originalTitle: movie.originalTitle,
        overview: movie.overview,
        tagline: movie.tagline,
        posterPath: `/posters/${movie.slug}.svg`,
        backdropPath: `/backdrops/${movie.slug}.svg`,
        releaseDate: new Date(`${movie.releaseDate}T12:00:00.000Z`),
        runtime: movie.runtime,
        voteAverage: movie.voteAverage,
        genres: {
          create: movie.genres.map((name) => ({
            genreId: genreByName.get(name)!.id,
          })),
        },
      },
    });
    mediaBySlug.set(movie.slug, {
      id: created.id,
      type: created.type,
      runtime: created.runtime,
      seasons: [],
    });
  }

  for (const show of shows) {
    const created = await prisma.media.create({
      data: {
        tmdbId: show.tmdbId,
        type: "TV",
        title: show.title,
        originalTitle: show.originalTitle,
        overview: show.overview,
        tagline: show.tagline,
        posterPath: `/posters/${show.slug}.svg`,
        backdropPath: `/backdrops/${show.slug}.svg`,
        releaseDate: new Date(`${show.releaseDate}T12:00:00.000Z`),
        runtime: null,
        voteAverage: show.voteAverage,
        genres: {
          create: show.genres.map((name) => ({
            genreId: genreByName.get(name)!.id,
          })),
        },
        seasons: {
          create: show.seasons.map((season) => ({
            seasonNumber: season.number,
            name: season.name,
            overview: season.overview,
            airDate: new Date(`${season.airDate}T12:00:00.000Z`),
            episodeCount: season.episodes.length,
            episodes: {
              create: season.episodes.map((episode, index) => ({
                episodeNumber: index + 1,
                name: episode.name,
                runtime: episode.runtime,
                airDate: new Date(
                  new Date(`${season.airDate}T12:00:00.000Z`).getTime() +
                    index * 7 * 86_400_000,
                ),
              })),
            },
          })),
        },
      },
      include: {
        seasons: {
          include: { episodes: { orderBy: { episodeNumber: "asc" } } },
          orderBy: { seasonNumber: "asc" },
        },
      },
    });

    mediaBySlug.set(show.slug, {
      id: created.id,
      type: created.type,
      runtime: created.runtime,
      seasons: created.seasons.map((season) => ({
        seasonNumber: season.seasonNumber,
        episodes: season.episodes.map((episode) => ({
          id: episode.id,
          episodeNumber: episode.episodeNumber,
          runtime: episode.runtime,
        })),
      })),
    });
  }

  const sortedDiary = [...diaryPlan].sort((a, b) => b.days - a.days);
  const seen = new Map<string, number>();
  const diaryData = [];

  for (const entry of sortedDiary) {
    const media = mediaBySlug.get(entry.slug);
    if (!media) continue;
    const prior = seen.get(entry.slug) ?? 0;
    seen.set(entry.slug, prior + 1);
    diaryData.push({
      userId: user.id,
      mediaId: media.id,
      watchedAt: daysAgo(entry.days, 19 + (entry.days % 4)),
      rating: entry.rating,
      review: entry.days < 120 ? (reviews[entry.slug] ?? null) : null,
      rewatch: prior > 0,
    });
  }

  await prisma.diaryEntry.createMany({ data: diaryData });

  const episodeWatchData: Array<{
    userId: string;
    episodeId: string;
    watchedAt: Date;
  }> = [];

  for (const plan of watchPlans) {
    const media = mediaBySlug.get(plan.slug);
    if (!media) continue;
    const episodes = media.seasons
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .flatMap((season) => season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber));
    const count = plan.count === "all" ? episodes.length : plan.count;
    const watched = episodes.slice(0, count);

    watched.forEach((episode, index) => {
      const days = plan.endDaysAgo + (watched.length - 1 - index) * plan.spacing;
      episodeWatchData.push({
        userId: user.id,
        episodeId: episode.id,
        watchedAt: daysAgo(days, 20 + (index % 3)),
      });
    });
  }

  await prisma.episodeWatch.createMany({ data: episodeWatchData });

  const libraryData = [];
  const latestMovieRating = new Map<string, number>();
  const firstMovieWatch = new Map<string, number>();

  for (const entry of sortedDiary) {
    latestMovieRating.set(entry.slug, entry.rating);
    if (!firstMovieWatch.has(entry.slug)) {
      firstMovieWatch.set(entry.slug, entry.days);
    }
  }

  for (const [slug, rating] of latestMovieRating) {
    const media = mediaBySlug.get(slug);
    if (!media) continue;
    const firstDays = firstMovieWatch.get(slug) ?? 300;
    libraryData.push({
      userId: user.id,
      mediaId: media.id,
      status: "WATCHED",
      rating,
      favorite: ["blade-runner-2049", "arrival", "whiplash"].includes(slug),
      addedAt: daysAgo(firstDays),
    });
  }

  for (const item of watchlist) {
    const media = mediaBySlug.get(item.slug);
    if (!media) continue;
    libraryData.push({
      userId: user.id,
      mediaId: media.id,
      status: "PLAN",
      rating: null,
      favorite: false,
      addedAt: daysAgo(item.days),
    });
  }

  const showFirstWatch = new Map<string, number>();
  for (const plan of watchPlans) {
    const media = mediaBySlug.get(plan.slug);
    if (!media) continue;
    const episodes = media.seasons.flatMap((season) => season.episodes);
    const count = plan.count === "all" ? episodes.length : plan.count;
    showFirstWatch.set(plan.slug, plan.endDaysAgo + (count - 1) * plan.spacing);
  }

  for (const show of shows) {
    const media = mediaBySlug.get(show.slug);
    if (!media) continue;
    const watchedAll =
      show.slug !== "the-bear" && show.slug !== "andor";
    libraryData.push({
      userId: user.id,
      mediaId: media.id,
      status: watchedAll ? "WATCHED" : "WATCHING",
      rating: showRatings[show.slug] ?? null,
      favorite: favoriteShows.has(show.slug),
      addedAt: daysAgo(showFirstWatch.get(show.slug) ?? 200),
    });
  }

  await prisma.libraryEntry.createMany({ data: libraryData });

  const lists = [
    {
      title: "Top Cyberpunk Series",
      description:
        "Corporations, neon, broken people, and one more job. Ranked by how long the credits kept me staring at the ceiling.",
      items: [
        { slug: "mr-robot", note: "The blueprint. A hacker story that becomes a study of the self." },
        { slug: "severance", note: "Office dystopia as an immaculate puzzle box." },
        { slug: "dark", note: "Time as a closed loop, shot in the color of wet asphalt." },
        { slug: "cyberpunk-edgerunners", note: "Ten episodes of pure velocity and heartbreak." },
        { slug: "andor", note: "Less neon, more fascism. Still the best rebellion on TV." },
      ],
    },
    {
      title: "Comfort Rewatches",
      description: "For the nights when the brain has left the building and the heart needs a familiar room.",
      items: [
        { slug: "the-bear", note: "Yes, chef." },
        { slug: "whiplash", note: "Not comfort exactly. Catharsis." },
        { slug: "her", note: "A warm blanket with a sad ending." },
        { slug: "everything-everywhere", note: "Be kind, especially to yourself." },
      ],
    },
    {
      title: "Films That Rewired My Brain",
      description: "The ones that changed the shape of the room on the way out.",
      items: [
        { slug: "arrival", note: "Time, language, and the choice to love anyway." },
        { slug: "blade-runner-2049", note: "A movie that feels like a memory you did not have." },
        { slug: "parasite", note: "Class as architecture." },
        { slug: "dune-part-two", note: "It is a tragedy, and it looks like a prophecy." },
      ],
    },
  ];

  for (const list of lists) {
    await prisma.list.create({
      data: {
        userId: user.id,
        title: list.title,
        description: list.description,
        isPublic: true,
        items: {
          create: list.items
            .map((item, index) => {
              const media = mediaBySlug.get(item.slug);
              if (!media) return null;
              return {
                mediaId: media.id,
                note: item.note,
                position: index,
              };
            })
            .filter((item): item is { mediaId: string; note: string; position: number } =>
              Boolean(item),
            ),
        },
      },
    });
  }

  console.log(
    `Seeded ${movies.length} films, ${shows.length} series, ${diaryData.length} diary entries, ${episodeWatchData.length} episode watches.`,
  );
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
