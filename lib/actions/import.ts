"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { importMediaFromTmdb } from "@/lib/import";
import { MEDIA_TYPES, type MediaType } from "@/lib/constants";

export async function importMediaAction(formData: FormData): Promise<void> {
  await requireUser();

  const parsed = z
    .object({
      tmdbId: z.coerce.number().int().positive(),
      type: z.enum(MEDIA_TYPES),
    })
    .safeParse({
      tmdbId: formData.get("tmdbId"),
      type: formData.get("type"),
    });

  if (!parsed.success) {
    redirect("/search?error=Invalid+title+selection.");
  }

  let mediaId: string | null = null;
  let errorMessage: string | null = null;

  try {
    mediaId = await importMediaFromTmdb(
      parsed.data.tmdbId,
      parsed.data.type as MediaType,
    );
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not import that title.";
  }

  if (!mediaId) {
    redirect(`/search?error=${encodeURIComponent(errorMessage ?? "Import failed.")}`);
  }

  revalidatePath("/search");
  revalidatePath("/library");
  redirect(`/media/${mediaId}`);
}
