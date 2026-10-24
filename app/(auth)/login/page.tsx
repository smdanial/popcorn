import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Play } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUser } from "@/lib/auth";
import { demoLoginAction } from "@/lib/actions/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = await searchParams;

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <Logo href="/login" />
      </div>

      <p className="eyebrow text-corn">Welcome back</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        Your watch life is waiting.
      </h1>
      <p className="mt-2 text-sm leading-6 text-mist">
        Sign in to pick up the diary, the lists, and the very important matter
        of how many days you have spent watching television.
      </p>

      {params.error === "demo-unavailable" && (
        <div className="mt-5 rounded-xl border border-ember/30 bg-ember/10 px-3.5 py-3 text-sm text-[#ffb7a6]">
          The demo account is not seeded yet. Run{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">npm run db:seed</code>{" "}
          and try again.
        </div>
      )}

      <div className="mt-7">
        <AuthForm mode="login" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
          or skip the setup
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-paper">Explore the demo library</p>
            <p className="mt-1 text-xs leading-5 text-mist">
              {DEMO_EMAIL} · password <span className="text-paper">{DEMO_PASSWORD}</span>
            </p>
          </div>
          <span className="chip border-corn/20 bg-corn/10 text-corn">Demo</span>
        </div>
        <form action={demoLoginAction} className="mt-3">
          <SubmitButton
            className="btn-secondary w-full"
            pendingChildren="Opening the demo…"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Enter as Alex
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
