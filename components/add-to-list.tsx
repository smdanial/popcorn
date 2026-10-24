import Link from "next/link";
import { ListPlus, Plus } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { addListItemAction } from "@/lib/actions/lists";

export function AddToList({
  mediaId,
  lists,
  listsContaining,
}: {
  mediaId: string;
  lists: Array<{ id: string; title: string }>;
  listsContaining: Array<{ id: string; title: string }>;
}) {
  const available = lists.filter(
    (list) => !listsContaining.some((item) => item.id === list.id),
  );

  return (
    <div>
      <p className="eyebrow mb-2 flex items-center gap-1.5">
        <ListPlus className="h-3.5 w-3.5" />
        Lists
      </p>

      {listsContaining.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {listsContaining.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="chip border-corn/20 bg-corn/10 text-corn hover:border-corn/40"
            >
              {list.title}
            </Link>
          ))}
        </div>
      )}

      {lists.length === 0 ? (
        <Link
          href="/lists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-corn hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Create your first list
        </Link>
      ) : available.length > 0 ? (
        <form action={addListItemAction} className="flex gap-2">
          <input type="hidden" name="mediaId" value={mediaId} />
          <select
            name="listId"
            className="field h-9 flex-1 py-1.5 text-xs"
            aria-label="Choose a list"
          >
            {available.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <SubmitButton className="btn-secondary h-9 px-3 text-xs" pendingChildren="Adding…">
            Add
          </SubmitButton>
        </form>
      ) : (
        <p className="text-xs text-mist">Already in all of your lists.</p>
      )}
    </div>
  );
}
