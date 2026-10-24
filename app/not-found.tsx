import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Logo href="/" />
      <span className="mt-8 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel text-mist">
        <Compass className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-5 text-corn">404 · off the reel</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        This scene does not exist.
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-mist">
        The title, list, or page you were looking for has left the library.
      </p>
      <Link href="/dashboard" className="btn-primary mt-6">
        Back to the dashboard
      </Link>
    </div>
  );
}
