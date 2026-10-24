import { revalidatePath } from "next/cache";

export function revalidateWatchData(mediaId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  revalidatePath("/library");
  revalidatePath("/diary");
  revalidatePath("/lists");
  if (mediaId) revalidatePath(`/media/${mediaId}`);
}
