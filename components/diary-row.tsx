import Link from "next/link";
import { Repeat2, Trash2 } from "lucide-react";
import { Poster } from "@/components/poster";
import { StarRating } from "@/components/star-rating";
import { SubmitButton } from "@/components/submit-button";
import { formatDate, formatYear } from "@/lib/format";
import { deleteDiaryEntry } from "@/lib/actions/diary";
import { cn } from "@/lib/utils";

export type DiaryRowEntry = {
  id: string;
  watchedAt: Date;
  rating: number | null;
  review: string | null;
  rewatch: boolean;
  media: {
    id: string;
    title: string;
    posterPath: string | null;
    releaseDate: Date | null;
  };
};

export function DiaryRow({
  entry,
  showDelete = false,
  compact = false,
  showReview = true,
  className,
}: {
  entry: DiaryRowEntry;
  showDelete?: boolean;
  compact?: boolean;
  showReview?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("group flex gap-3 py-3.5", className)}>
      <Link href={`/media/${entry.media.id}`} className="shrink-0">
        <Poster
          src={entry.media.posterPath}
          alt={entry.media.title}
          className={compact ? "h-16 w-11 rounded-lg" : "h-20 w-14 rounded-lg"}
          sizes="56px"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/media/${entry.media.id}`}
              className="block truncate text-sm font-semibold text-paper hover:text-corn"
            >
              {entry.media.title}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-mist">
              <span>{formatYear(entry.media.releaseDate) ?? "—"}</span>
              {entry.rewatch && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-mint">
                  <Repeat2 className="h-3 w-3" />
                  Rewatch
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-[11px] text-mist">
            {formatDate(entry.watchedAt)}
          </span>
        </div>

        <div className="mt-1.5">
          <StarRating value={entry.rating} size={12} showValue />
        </div>

        {showReview && entry.review && (
          <p
            className={cn(
              "mt-2 text-xs leading-5 text-mist",
              compact ? "line-clamp-1" : "line-clamp-2",
            )}
          >
            {entry.review}
          </p>
        )}
      </div>

      {showDelete && (
        <form action={deleteDiaryEntry} className="shrink-0 self-start">
          <input type="hidden" name="entryId" value={entry.id} />
          <SubmitButton
            className="icon-btn h-8 w-8 opacity-60 hover:border-ember/30 hover:text-ember group-hover:opacity-100"
            pendingChildren={null}
            aria-label="Delete diary entry"
            title="Delete entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
