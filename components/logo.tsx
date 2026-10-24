import Link from "next/link";
import { Popcorn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/dashboard",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="PopCorn home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-corn text-ink shadow-glow transition-transform group-hover:-rotate-6">
        <Popcorn className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-tight text-paper">
          Pop<span className="text-corn">Corn</span>
        </span>
      )}
    </Link>
  );
}
