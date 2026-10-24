import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Globe2,
  ListVideo,
  Lock,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { MediaCard } from "@/components/media-card";
import { EmptyState } from "@/components/empty-state";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteListAction,
  removeListItemAction,
} from "@/lib/actions/lists";
import { DEFAULT_EPISODE_RUNTIME } from "@/lib/constants";
import {
  formatDate,
  formatHoursMinutes,
  formatRuntime,
  pluralize,
} from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const list = await prisma.list.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: list?.title ?? "List" };
}

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const list = await prisma.list.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: {
          media: {
            include: {
              seasons: {
                select: { episodes: { select: { runtime: true } } },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!list) notFound();

  const totalMinutes = list.items.reduce((sum, item) => {
    if (item.media.type === "MOVIE") return sum + (item.media.runtime ?? 0);
    return (
      sum +
      item.media.seasons.reduce(
        (seasonSum, season) =>
          seasonSum +
          season.episodes.reduce(
            (episodeSum, episode) =>
              episodeSum + (episode.runtime ?? DEFAULT_EPISODE_RUNTIME),
            0,
          ),
        0,
      )
    );
  }, 0);

  const films = list.items.filter((item) => item.media.type === "MOVIE").length;
  const series = list.items.length - films;

  return (
    <div className="container-page py-8 sm:py-12">
      <Link
        href="/lists"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist transition-colors hover:text-corn"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All lists
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-corn/20 bg-corn/10 text-corn">
              <ListVideo className="h-3 w-3" />
              List
            </span>
            <span className="chip">
              {list.isPublic ? (
                <Globe2 className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              {list.isPublic ? "Public" : "Private"}
            </span>
            <span className="chip">
              <Clock3 className="h-3 w-3" />
              {formatHoursMinutes(totalMinutes)}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            {list.title}
          </h1>
          {list.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
              {list.description}
            </p>
          )}
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-mist">
            <span>
              {list.items.length} {pluralize(list.items.length, "title")}
            </span>
            <span className="h-1 w-1 rounded-full bg-mist/40" />
            <span>{films} films</span>
            <span className="h-1 w-1 rounded-full bg-mist/40" />
            <span>{series} series</span>
            <span className="h-1 w-1 rounded-full bg-mist/40" />
            <span>Updated {formatDate(list.updatedAt)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/search" className="btn-primary">
            <Plus className="h-4 w-4" />
            Add titles
          </Link>
          <form action={deleteListAction}>
            <input type="hidden" name="listId" value={list.id} />
            <ConfirmSubmitButton
              message="Delete this list? The titles stay in your library."
              className="btn-secondary border-ember/20 text-ember hover:bg-ember/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="mt-8">
        {list.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.items.map((item, index) => (
              <div key={item.id} className="group relative min-w-0">
                <MediaCard
                  item={{
                    id: item.media.id,
                    title: item.media.title,
                    posterPath: item.media.posterPath,
                    type: item.media.type,
                    releaseDate: item.media.releaseDate,
                    runtimeLabel:
                      item.media.type === "MOVIE"
                        ? formatRuntime(item.media.runtime)
                        : "Series",
                  }}
                  priority={index < 5}
                />

                {item.note && (
                  <p className="mt-2 line-clamp-3 border-l border-corn/30 pl-2 text-[11px] italic leading-5 text-mist">
                    {item.note}
                  </p>
                )}

                <form
                  action={removeListItemAction}
                  className="absolute right-1.5 top-1.5 z-20 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                >
                  <input type="hidden" name="listId" value={list.id} />
                  <input type="hidden" name="mediaId" value={item.mediaId} />
                  <ConfirmSubmitButton
                    message={`Remove ${item.media.title} from this list?`}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/70 text-white/80 backdrop-blur transition-colors hover:border-ember/40 hover:text-ember"
                    aria-label={`Remove ${item.media.title} from list`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ListVideo}
            title="This list is empty"
            description="Search for a title, open its page, and add it to this list from the sidebar."
            actionLabel="Find titles"
            actionHref="/search"
          />
        )}
      </div>
    </div>
  );
}
