"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import { createListAction } from "@/lib/actions/lists";
import { SubmitButton } from "@/components/submit-button";

export function CreateListForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createListAction({}, formData);
    if (result.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="card p-5">
      <p className="eyebrow flex items-center gap-1.5 text-corn">
        <ListPlus className="h-3.5 w-3.5" />
        New list
      </p>
      <h2 className="mt-1 text-lg font-bold tracking-tight">Curate something</h2>
      <p className="mt-1 text-xs leading-5 text-mist">
        Rank a genre, collect a mood, or make a case for the films everyone
        else got wrong.
      </p>

      {error && (
        <p className="mt-3 rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-xs text-[#ffb7a6]">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="list-title" className="mb-1.5 block text-xs font-semibold text-mist">
            Title
          </label>
          <input
            id="list-title"
            name="title"
            required
            maxLength={80}
            placeholder="Top cyberpunk series"
            className="field"
          />
        </div>
        <div>
          <label
            htmlFor="list-description"
            className="mb-1.5 block text-xs font-semibold text-mist"
          >
            Description <span className="font-normal text-mist/60">(optional)</span>
          </label>
          <textarea
            id="list-description"
            name="description"
            rows={2}
            maxLength={600}
            placeholder="Why these, why this order?"
            className="field resize-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-mist">
          <input
            type="checkbox"
            name="isPublic"
            defaultChecked
            className="h-4 w-4 rounded border-line bg-ink accent-[#f7c948]"
          />
          Make this list public
        </label>
      </div>

      <SubmitButton
        className="btn-primary mt-4 w-full"
        pendingChildren="Creating…"
      >
        Create list
      </SubmitButton>
    </form>
  );
}
