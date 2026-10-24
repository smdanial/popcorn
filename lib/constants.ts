export const MEDIA_TYPES = ["MOVIE", "TV"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const LIBRARY_STATUSES = [
  "PLAN",
  "WATCHING",
  "WATCHED",
  "PAUSED",
  "DROPPED",
] as const;
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export const STATUS_LABELS: Record<LibraryStatus, string> = {
  PLAN: "Watchlist",
  WATCHING: "Watching",
  WATCHED: "Watched",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

export const DEFAULT_EPISODE_RUNTIME = 45;
export const DEMO_EMAIL = "demo@popcorn.app";
export const DEMO_PASSWORD = "popcorn";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/diary", label: "Diary" },
  { href: "/lists", label: "Lists" },
  { href: "/stats", label: "Stats" },
] as const;
