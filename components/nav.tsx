import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { MobileNav } from "@/components/mobile-nav";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";

export function Nav({ user }: { user: SessionUser }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-4 sm:gap-6">
          <Logo />
          <NavLinks />

          <div className="ml-auto flex items-center gap-2.5">
            <form action="/search" className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                type="search"
                name="q"
                placeholder="Search films, shows…"
                aria-label="Search films and shows"
                className="h-9 w-44 rounded-full border border-line bg-panel/60 pl-9 pr-3 text-sm text-paper placeholder:text-mist/70 transition-colors focus:border-corn/40 focus:outline-none focus:ring-2 focus:ring-corn/20 lg:w-64"
              />
            </form>

            <Link
              href="/search"
              className="icon-btn h-9 w-9 sm:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-line bg-panel/60 py-1 pl-1 pr-3 sm:flex">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-extrabold text-ink"
                style={{ backgroundColor: user.avatarColor }}
              >
                {initials(user.name)}
              </span>
              <span className="max-w-28 truncate text-xs font-semibold text-paper">
                {user.name}
              </span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="icon-btn h-9 w-9"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
}
