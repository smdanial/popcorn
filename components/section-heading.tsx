import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  href,
  action = "View all",
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-paper sm:text-xl">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-mist sm:text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-mist transition-colors hover:text-corn"
        >
          {action}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
