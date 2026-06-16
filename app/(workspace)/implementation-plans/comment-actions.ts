"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { createCommentRecord } from "@/lib/data-access";

const createPlanCommentSchema = z.object({
  planId: z.string().min(1, "Plan id is required."),
  message: z.string().min(2, "Comment is required."),
  clientFacing: z.boolean(),
});

export type CreatePlanCommentFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createPlanCommentAction(
  _previousState: CreatePlanCommentFormState,
  formData: FormData,
) {
  const session = await requireSession();

  const parsed = createPlanCommentSchema.safeParse({
    planId: formData.get("planId"),
    message: formData.get("message"),
    clientFacing: formData.get("clientFacing") === "on",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createCommentRecord({
    entityType: "IMPLEMENTATION_PLAN",
    entityId: parsed.data.planId,
    authorId: session.id,
    message: parsed.data.message,
    clientFacing: parsed.data.clientFacing,
  });

  revalidatePath(`/implementation-plans/${parsed.data.planId}`);

  return {
    message: "Comment added.",
  };
}
