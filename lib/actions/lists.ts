"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ListFormState = { error?: string };

const listSchema = z.object({
  title: z.string().trim().min(2, "Give the list a title.").max(80),
  description: z.string().trim().max(600).optional(),
  isPublic: z.boolean(),
});

export async function createListAction(
  _previous: ListFormState,
  formData: FormData,
): Promise<ListFormState> {
  const user = await requireUser();
  const parsed = listSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Could not create this list." };
  }

  const list = await prisma.list.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      isPublic: parsed.data.isPublic,
    },
  });

  redirect(`/lists/${list.id}`);
}

export async function deleteListAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const listId = z.string().min(1).parse(formData.get("listId"));

  await prisma.list.deleteMany({ where: { id: listId, userId: user.id } });
  redirect("/lists");
}

export async function addListItemAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({ listId: z.string().min(1), mediaId: z.string().min(1) })
    .safeParse({
      listId: formData.get("listId"),
      mediaId: formData.get("mediaId"),
    });
  if (!parsed.success) return;

  const list = await prisma.list.findFirst({
    where: { id: parsed.data.listId, userId: user.id },
    select: { id: true, _count: { select: { items: true } } },
  });
  if (!list) return;

  await prisma.listItem.upsert({
    where: {
      listId_mediaId: {
        listId: list.id,
        mediaId: parsed.data.mediaId,
      },
    },
    update: {},
    create: {
      listId: list.id,
      mediaId: parsed.data.mediaId,
      position: list._count.items,
    },
  });

  revalidatePath("/lists");
  revalidatePath(`/lists/${list.id}`);
  revalidatePath(`/media/${parsed.data.mediaId}`);
}

export async function removeListItemAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({ listId: z.string().min(1), mediaId: z.string().min(1) })
    .safeParse({
      listId: formData.get("listId"),
      mediaId: formData.get("mediaId"),
    });
  if (!parsed.success) return;

  const list = await prisma.list.findFirst({
    where: { id: parsed.data.listId, userId: user.id },
    select: { id: true },
  });
  if (!list) return;

  await prisma.listItem.deleteMany({
    where: { listId: list.id, mediaId: parsed.data.mediaId },
  });

  revalidatePath("/lists");
  revalidatePath(`/lists/${list.id}`);
  revalidatePath(`/media/${parsed.data.mediaId}`);
}
