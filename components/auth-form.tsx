"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { loginAction, signupAction, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const initialState: AuthState = {};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-ember/30 bg-ember/10 px-3.5 py-3 text-sm text-[#ffb7a6]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-mist">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Ada Lovelace"
            className="field"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-mist">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-mist">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          className="field"
        />
      </div>

      <SubmitButton
        className="btn-primary mt-2 w-full py-2.5"
        pendingChildren={mode === "login" ? "Signing in…" : "Creating account…"}
      >
        {mode === "login" ? "Sign in" : "Create account"}
      </SubmitButton>

      <p className="pt-1 text-center text-xs text-mist">
        {mode === "login" ? (
          <>
            New to PopCorn?{" "}
            <Link href="/signup" className="font-semibold text-corn hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already tracking?{" "}
            <Link href="/login" className="font-semibold text-corn hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
