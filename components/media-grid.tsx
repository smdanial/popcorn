import { MediaCard, type MediaCardItem } from "@/components/media-card";
import { cn } from "@/lib/utils";

export function MediaGrid({
  items,
  className,
  priorityCount = 0,
}: {
  items: MediaCardItem[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6",
        className,
      )}
    >
      {items.map((item, index) => (
        <MediaCard key={item.id} item={item} priority={index < priorityCount} />
      ))}
    </div>
  );
}
