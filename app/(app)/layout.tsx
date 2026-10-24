import { Nav } from "@/components/nav";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
      <Nav user={user} />
      <main className="flex-1">{children}</main>
      <footer className="container-page flex flex-col gap-2 border-t border-line py-8 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>PopCorn — every episode counts.</p>
        <p>Built with Next.js, Prisma & TMDB.</p>
      </footer>
    </div>
  );
}
