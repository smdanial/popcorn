import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  Film,
  KeyRound,
  Search,
  Star,
  Tv,
} from "lucide-react";
import { Poster } from "@/components/poster";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { importMediaAction } from "@/lib/actions/import";
import {
  isTmdbConfigured,
  searchTmdb,
  tmdbImage,
  tmdbYear,
  trendingTmdb,
  type TmdbSearchResult,
} from "@/lib/tmdb";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const configured = isTmdbConfigured();

  let results: TmdbSearchResult[] = [];
  let tmdbError: string | null = null;

  if (configured) {
    try {
      results = query ? await searchTmdb(query) : await trendingTmdb();
    } catch (error) {
      tmdbError = error instanceof Error ? error.message : "TMDB request failed.";
    }
  }

  const existing = results.length
    ? await prisma.media.findMany({
        where: {
          OR: results.map((result) => ({
            tmdbId: result.id,
            type: result.media_type === "movie" ? "MOVIE" : "TV",
          })),
        },
        select: { id: true, tmdbId: true, type: true },
      })
    : [];

  const existingByKey = new Map(
    existing.map((item) => [`${item.type}:${item.tmdbId}`, item.id]),
  );

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow flex items-center justify-center gap-2 text-corn">
          <Search className="h-3.5 w-3.5" />
          TMDB search
        </p>
        <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find your next obsession.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-mist">
          Search films and series, then import their full runtime and episode
          data. Once imported, every log and tick contributes to your lifetime
          stats.
        </p>

        <form action="/search" className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try “Blade Runner”, “Severance”, “Park Chan-wook”…"
            aria-label="Search TMDB"
            className="h-12 w-full rounded-full border border-line bg-panel/80 pl-11 pr-28 text-sm text-paper placeholder:text-mist/60 focus:border-corn/40 focus:outline-none focus:ring-2 focus:ring-corn/20"
          />
          <button type="submit" className="btn-primary absolute right-1.5 top-1/2 h-9 -translate-y-1/2 px-4">
            Search
          </button>
        </form>
      </div>

      {(params.error || tmdbError) && (
        <div className="mx-auto mt-6 flex max-w-2xl items-start gap-2.5 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-[#ffb7a6]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{params.error ?? tmdbError}</p>
        </div>
      )}

      {!configured && (
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="card overflow-hidden">
            <div className="border-b border-line bg-corn/[0.04] px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-bold text-corn">
                <KeyRound className="h-4 w-4" />
                Connect TMDB to enable search
              </p>
              <p className="mt-1 text-xs leading-5 text-mist">
                Add one of these credentials to your{" "}
                <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-paper">
                  .env
                </code>{" "}
                file, then restart the dev server.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold text-paper">
                  Option A — v3 API key
                </p>
                <pre className="mt-1.5 overflow-x-auto rounded-lg border border-line bg-ink/80 px-3 py-2.5 text-[11px] text-mint">
                  TMDB_API_KEY=&quot;your_v3_api_key&quot;
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-paper">
                  Option B — v4 read access token
                </p>
                <pre className="mt-1.5 overflow-x-auto rounded-lg border border-line bg-ink/80 px-3 py-2.5 text-[11px] text-mint">
                  TMDB_READ_ACCESS_TOKEN=&quot;your_v4_token&quot;
                </pre>
              </div>
              <p className="text-xs leading-5 text-mist">
                The seeded demo already includes 20 films and series, so
                analytics and episode tracking work without a TMDB key.
              </p>
              <Link href="/library" className="btn-secondary">
                Browse the seeded library
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {configured && (
        <div className="mt-10">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {query ? `Results for “${query}”` : "Trending this week"}
              </h2>
              <p className="mt-1 text-xs text-mist">
                {query
                  ? `${results.length} ${results.length === 1 ? "match" : "matches"} from TMDB`
                  : "What the rest of the world is watching right now."}
              </p>
            </div>
            <span className="chip">
              {results.filter((result) => result.media_type === "movie").length} films ·{" "}
              {results.filter((result) => result.media_type === "tv").length} series
            </span>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description="Try a shorter query, or check the spelling. TMDB search is particular about punctuation."
            />
          ) : (
            <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6">
              {results.map((result, index) => {
                const title = result.title ?? result.name ?? "Untitled";
                const year = tmdbYear(result.release_date ?? result.first_air_date);
                const type = result.media_type === "movie" ? "MOVIE" : "TV";
                const existingId = existingByKey.get(`${type}:${result.id}`);

                return (
                  <div key={`${result.media_type}-${result.id}`} className="min-w-0">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] bg-panel2 shadow-card">
                      <Poster
                        src={tmdbImage(result.poster_path, "w500")}
                        alt={title}
                        type={type}
                        priority={index < 4}
                        className="h-full w-full rounded-xl"
                        sizes="(max-width: 640px) 33vw, 190px"
                      />
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        {type === "TV" ? (
                          <Tv className="h-3 w-3" />
                        ) : (
                          <Film className="h-3 w-3" />
                        )}
                        {type === "TV" ? "Series" : "Film"}
                      </span>
                      {result.vote_average ? (
                        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                          <Star className="h-3 w-3 fill-corn text-corn" />
                          {formatNumber(result.vote_average)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2.5">
                      <h3 className="truncate text-[13px] font-semibold text-paper">
                        {title}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-mist">{year ?? "—"}</p>

                      <div className="mt-2">
                        {existingId ? (
                          <Link
                            href={`/media/${existingId}`}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-mint/25 bg-mint/10 px-2 py-1.5 text-[11px] font-bold text-mint"
                          >
                            In library
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <form action={importMediaAction}>
                            <input type="hidden" name="tmdbId" value={result.id} />
                            <input type="hidden" name="type" value={type} />
                            <SubmitButton
                              className="w-full rounded-full border border-line bg-panel2/80 px-2 py-1.5 text-[11px] font-bold text-paper transition-colors hover:border-corn/30 hover:text-corn"
                              pendingChildren="Importing…"
                            >
                              <Download className="h-3 w-3" />
                              Import
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {configured && !query && (
        <p className="mt-10 text-center text-[11px] text-mist">
          Importing a series pulls every season and episode runtime from TMDB.
          This can take a few seconds.
        </p>
      )}
    </div>
  );
}
