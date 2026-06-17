"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { createCommentRecord } from "@/lib/data-access";

const createCommentSchema = z.object({
  entityType: z.enum(["CLIENT", "TASK", "DOCUMENT", "IMPLEMENTATION_PLAN"]),
  entityId: z.string().min(1, "Entity id is required."),
  message: z.string().min(2, "Comment is required."),
  clientFacing: z.boolean(),
  revalidateTarget: z.string().optional(),
});

export type CreateEntityCommentFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createEntityCommentAction(
  _previousState: CreateEntityCommentFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const parsed = createCommentSchema.safeParse({
    entityType: formData.get("entityType"),
    entityId: formData.get("entityId"),
    message: formData.get("message"),
    clientFacing: formData.get("clientFacing") === "on",
    revalidateTarget: formData.get("revalidateTarget") || undefined,
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createCommentRecord({
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    authorId: session.id,
    message: parsed.data.message,
    clientFacing: parsed.data.clientFacing,
  });

  revalidatePath(parsed.data.revalidateTarget ?? "/dashboard");

  return {
    message: "Comment added.",
  };
}
