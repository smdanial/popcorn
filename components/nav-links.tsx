"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {NAV_LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "text-paper" : "text-mist hover:text-paper",
            )}
          >
            {link.label}
            {active && (
              <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-corn" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
