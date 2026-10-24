"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidateWatchData } from "@/lib/revalidate";
import { safeParseDate } from "@/lib/utils";

export type DiaryFormState = { ok?: boolean; error?: string };

const diarySchema = z.object({
  mediaId: z.string().min(1),
  watchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  review: z.string().max(6000).optional(),
});

export async function createDiaryEntry(
  _previous: DiaryFormState,
  formData: FormData,
): Promise<DiaryFormState> {
  const user = await requireUser();
  const parsed = diarySchema.safeParse({
    mediaId: formData.get("mediaId"),
    watchedAt: formData.get("watchedAt"),
    review: formData.get("review") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not save this entry." };
  }

  const media = await prisma.media.findUnique({
    where: { id: parsed.data.mediaId },
    select: { id: true },
  });
  if (!media) return { error: "That title could not be found." };

  const watchedAt = safeParseDate(parsed.data.watchedAt);
  if (!watchedAt) return { error: "Pick a valid date." };

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const ratingValue = ratingRaw === "" ? null : Number(ratingRaw);
  const rating =
    ratingValue !== null && Number.isFinite(ratingValue) && ratingValue > 0
      ? Math.min(5, Math.max(0.5, Math.round(ratingValue * 2) / 2))
      : null;

  const priorCount = await prisma.diaryEntry.count({
    where: { userId: user.id, mediaId: media.id },
  });

  await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      mediaId: media.id,
      watchedAt,
      rating,
      review: parsed.data.review?.trim() || null,
      rewatch: priorCount > 0,
    },
  });

  await prisma.libraryEntry.upsert({
    where: { userId_mediaId: { userId: user.id, mediaId: media.id } },
    update: { status: "WATCHED", ...(rating !== null ? { rating } : {}) },
    create: {
      userId: user.id,
      mediaId: media.id,
      status: "WATCHED",
      rating,
    },
  });

  revalidateWatchData(media.id);
  return { ok: true };
}

export async function deleteDiaryEntry(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = z.string().min(1).parse(formData.get("entryId"));

  const entry = await prisma.diaryEntry.findFirst({
    where: { id, userId: user.id },
    select: { id: true, mediaId: true },
  });
  if (!entry) return;

  await prisma.diaryEntry.delete({ where: { id: entry.id } });
  revalidateWatchData(entry.mediaId);
}
