import Link from "next/link";
import {
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Heart,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import {
  removeFromLibrary,
  toggleFavorite,
  toggleWatchlist,
} from "@/lib/actions/library";
import { cn } from "@/lib/utils";

export function WatchActions({
  mediaId,
  status,
  favorite,
}: {
  mediaId: string;
  status: string | null;
  favorite: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!status && (
        <form action={toggleWatchlist}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <SubmitButton className="btn-secondary" pendingChildren="Adding…">
            <BookmarkPlus className="h-4 w-4" />
            Watchlist
          </SubmitButton>
        </form>
      )}

      {status === "PLAN" && (
        <form action={toggleWatchlist}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <SubmitButton
            className="btn-secondary border-corn/25 text-corn"
            pendingChildren="Removing…"
            title="Click to remove from watchlist"
          >
            <BookmarkCheck className="h-4 w-4" />
            On watchlist
          </SubmitButton>
        </form>
      )}

      {status === "WATCHING" && (
        <span className="btn-secondary cursor-default border-mint/20 text-mint">
          <PlayCircle className="h-4 w-4" />
          Watching
        </span>
      )}

      {status === "WATCHED" && (
        <span className="btn-secondary cursor-default border-corn/20 text-corn">
          <Check className="h-4 w-4" />
          Watched
        </span>
      )}

      {status === "PAUSED" && (
        <span className="btn-secondary cursor-default text-mist">
          <PauseCircle className="h-4 w-4" />
          Paused
        </span>
      )}

      {status === "DROPPED" && (
        <span className="btn-secondary cursor-default text-mist">
          <XCircle className="h-4 w-4" />
          Dropped
        </span>
      )}

      <form action={toggleFavorite}>
        <input type="hidden" name="mediaId" value={mediaId} />
        <SubmitButton
          className={cn(
            "btn-secondary h-10 w-10 px-0",
            favorite && "border-ember/30 text-ember",
          )}
          pendingChildren={null}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          title={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </SubmitButton>
      </form>

      {status && status !== "PLAN" && (
        <form action={removeFromLibrary}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <SubmitButton
            className="btn-ghost h-10 px-2.5 text-xs"
            pendingChildren="Removing…"
          >
            Remove
          </SubmitButton>
        </form>
      )}

      {status === "PLAN" && (
        <Link
          href="/library?status=PLAN"
          className="btn-ghost h-10 px-2.5 text-xs"
        >
          Watchlist
        </Link>
      )}
    </div>
  );
}
