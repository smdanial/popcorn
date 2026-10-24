import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <Logo href="/login" />
      </div>

      <p className="eyebrow text-corn">Start counting</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        Make your screen time mean something.
      </h1>
      <p className="mt-2 text-sm leading-6 text-mist">
        Create an account, then import films and series from TMDB. Every
        episode you tick becomes another beautifully quantified hour.
      </p>

      <div className="mt-7">
        <AuthForm mode="signup" />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-xs leading-5 text-mist">
        Want to see the full experience first? Use the seeded demo on the{" "}
        <a href="/login" className="font-semibold text-corn hover:underline">
          sign-in page
        </a>
        .
      </div>
    </div>
  );
}
