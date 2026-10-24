"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Clapperboard, X } from "lucide-react";
import { createDiaryEntry } from "@/lib/actions/diary";
import { SubmitButton } from "@/components/submit-button";
import { StarInput } from "@/components/star-input";

export function LogWatchDialog({
  mediaId,
  mediaTitle,
  defaultRating,
}: {
  mediaId: string;
  mediaTitle: string;
  defaultRating?: number | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Clapperboard className="h-4 w-4" />
        Log a watch
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-watch-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg animate-fade-up rounded-t-3xl border border-line bg-panel p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-corn">New diary entry</p>
                <h2
                  id="log-watch-title"
                  className="mt-1 text-lg font-bold tracking-tight"
                >
                  {mediaTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn h-8 w-8"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <LogWatchForm
              mediaId={mediaId}
              defaultRating={defaultRating ?? 0}
              onDone={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function LogWatchForm({
  mediaId,
  defaultRating,
  onDone,
}: {
  mediaId: string;
  defaultRating: number;
  onDone: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(defaultRating);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createDiaryEntry({}, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-5 space-y-4">
      <input type="hidden" name="mediaId" value={mediaId} />
      <input type="hidden" name="rating" value={rating} />

      {error && (
        <div className="rounded-xl border border-ember/30 bg-ember/10 px-3 py-2.5 text-xs text-[#ffb7a6]">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="watchedAt"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-mist"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Watched on
        </label>
        <input
          id="watchedAt"
          name="watchedAt"
          type="date"
          defaultValue={today}
          max={today}
          required
          className="field"
        />
      </div>

      <div>
        <span className="mb-2 block text-xs font-semibold text-mist">Your rating</span>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review" className="mb-1.5 block text-xs font-semibold text-mist">
          Review <span className="font-normal text-mist/60">(optional)</span>
        </label>
        <textarea
          id="review"
          name="review"
          rows={3}
          maxLength={6000}
          placeholder="What did you make of it?"
          className="field resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
        <SubmitButton className="btn-primary" pendingChildren="Saving…">
          <Check className="h-4 w-4" />
          Save to diary
        </SubmitButton>
      </div>
    </form>
  );
}
