"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-ember/30 bg-ember/10 text-ember">
        <TriangleAlert className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-5 text-ember">Scene interrupted</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        Something went off-script.
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-mist">
        An unexpected error interrupted the page. Try again, or head back to the
        dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link href="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
