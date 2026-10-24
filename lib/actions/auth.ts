"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";
import { createSession, destroySession } from "@/lib/auth";

export type AuthState = { error?: string };

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function loginAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signupAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hash(parsed.data.password, 10),
      avatarColor: "#f7c948",
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function demoLoginAction(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user || !(await compare(DEMO_PASSWORD, user.passwordHash))) {
    redirect("/login?error=demo-unavailable");
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
