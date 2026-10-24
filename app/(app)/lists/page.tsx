import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, ListVideo, Lock, Plus } from "lucide-react";
import { CreateListForm } from "@/components/create-list-form";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Lists" };

export default async function ListsPage() {
  const user = await requireUser();

  const lists = await prisma.list.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { media: true },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalTitles = lists.reduce((sum, list) => sum + list.items.length, 0);
  const publicLists = lists.filter((list) => list.isPublic).length;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-corn">
            <ListVideo className="h-3.5 w-3.5" />
            Lists
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Small canons, carefully argued.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-mist">
            Rank a genre, collect a mood, or make a case for the films everyone
            else got wrong. Lists are where the diary becomes an opinion.
          </p>
        </div>
        <Link href="/search" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Find titles to add
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <StatCard
          icon={ListVideo}
          label="Lists"
          value={String(lists.length)}
          sub="curated collections"
          tone="corn"
        />
        <StatCard
          icon={Globe2}
          label="Titles"
          value={String(totalTitles)}
          sub={`across all ${pluralize(lists.length, "list")}`}
          tone="mint"
        />
        <StatCard
          icon={Globe2}
          label="Public"
          value={String(publicLists)}
          sub="shareable canons"
          tone="sky"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {lists.length === 0 ? (
            <EmptyState
              icon={ListVideo}
              title="No lists yet"
              description="Start with a mood, a genre, or a very strong opinion. Add titles from any detail page."
              actionLabel="Browse films"
              actionHref="/search"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {lists.map((list) => {
                const posters = list.items.slice(0, 4);
                const films = list.items.filter(
                  (item) => item.media.type === "MOVIE",
                ).length;
                const series = list.items.length - films;

                return (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    className="card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    <div
                      className={cn(
                        "relative h-40 overflow-hidden border-b border-line",
                        posters.length === 0 && "bg-gradient-to-br from-panel2 to-coal",
                      )}
                    >
                      {posters.length > 0 ? (
                        <div className="grid h-full grid-cols-4">
                          {posters.map((item, index) => (
                            <div key={item.id} className="relative overflow-hidden">
                              {item.media.posterPath ? (
                                <Image
                                  src={item.media.posterPath}
                                  alt=""
                                  fill
                                  sizes="120px"
                                  className={cn(
                                    "object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100",
                                    index === 0 && "object-left",
                                  )}
                                />
                              ) : (
                                <div className="h-full w-full bg-panel2" />
                              )}
                            </div>
                          ))}
                          {Array.from({ length: 4 - posters.length }).map((_, index) => (
                            <div key={`filler-${index}`} className="bg-panel2/80" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ListVideo className="h-8 w-8 text-white/15" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                        <span className="chip border-white/15 bg-black/40 text-white backdrop-blur">
                          {list.items.length}{" "}
                          {pluralize(list.items.length, "title")}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
                          {list.isPublic ? (
                            <Globe2 className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {list.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h2 className="text-base font-bold tracking-tight text-paper group-hover:text-corn">
                        {list.title}
                      </h2>
                      {list.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-mist">
                          {list.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-mist">
                        <span>{films} films</span>
                        <span className="h-1 w-1 rounded-full bg-mist/40" />
                        <span>{series} series</span>
                        <span className="h-1 w-1 rounded-full bg-mist/40" />
                        <span>Updated {formatDate(list.updatedAt)}</span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-corn opacity-0 transition-opacity group-hover:opacity-100">
                        Open list
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside>
          <div className="sticky top-24">
            <CreateListForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
