"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidateWatchData } from "@/lib/revalidate";

const mediaIdSchema = z.string().min(1);

export async function toggleWatchlist(formData: FormData): Promise<void> {
  const user = await requireUser();
  const mediaId = mediaIdSchema.parse(formData.get("mediaId"));

  const existing = await prisma.libraryEntry.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId } },
  });

  if (existing?.status === "PLAN") {
    await prisma.libraryEntry.delete({ where: { id: existing.id } });
  } else {
    await prisma.libraryEntry.upsert({
      where: { userId_mediaId: { userId: user.id, mediaId } },
      update: { status: "PLAN" },
      create: { userId: user.id, mediaId, status: "PLAN" },
    });
  }

  revalidateWatchData(mediaId);
}

export async function toggleFavorite(formData: FormData): Promise<void> {
  const user = await requireUser();
  const mediaId = mediaIdSchema.parse(formData.get("mediaId"));

  const existing = await prisma.libraryEntry.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId } },
  });

  if (existing) {
    await prisma.libraryEntry.update({
      where: { id: existing.id },
      data: { favorite: !existing.favorite },
    });
  } else {
    await prisma.libraryEntry.create({
      data: { userId: user.id, mediaId, status: "PLAN", favorite: true },
    });
  }

  revalidateWatchData(mediaId);
}

export async function removeFromLibrary(formData: FormData): Promise<void> {
  const user = await requireUser();
  const mediaId = mediaIdSchema.parse(formData.get("mediaId"));

  await prisma.libraryEntry.deleteMany({
    where: { userId: user.id, mediaId },
  });

  revalidateWatchData(mediaId);
}
