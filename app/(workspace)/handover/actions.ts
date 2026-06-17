"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { signOffStatuses } from "@/lib/domain";
import { updateHandoverRecord } from "@/lib/data-access";

const updateHandoverSchema = z.object({
  handoverId: z.string().min(1, "Handover id is required."),
  walkthroughDate: z.string().min(1, "Walkthrough date is required."),
  signOffStatus: z.enum(signOffStatuses, "Sign-off status is required."),
  signedBy: z.string().optional(),
  signOffDate: z.string().optional(),
  checklist: z.string().optional(),
  pendingActions: z.string().optional(),
  closureNotes: z.string().optional(),
});

export type UpdateHandoverFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function splitLines(value?: string) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function updateHandoverAction(
  _previousState: UpdateHandoverFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const parsed = updateHandoverSchema.safeParse({
    handoverId: formData.get("handoverId"),
    walkthroughDate: formData.get("walkthroughDate"),
    signOffStatus: formData.get("signOffStatus"),
    signedBy: formData.get("signedBy"),
    signOffDate: formData.get("signOffDate"),
    checklist: formData.get("checklist"),
    pendingActions: formData.get("pendingActions"),
    closureNotes: formData.get("closureNotes"),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateHandoverRecord({
      handoverId: parsed.data.handoverId,
      walkthroughDate: parsed.data.walkthroughDate,
      signOffStatus: parsed.data.signOffStatus,
      signedBy: parsed.data.signedBy?.trim() || undefined,
      signOffDate: parsed.data.signOffDate?.trim() || undefined,
      checklist: splitLines(parsed.data.checklist),
      pendingActions: splitLines(parsed.data.pendingActions),
      closureNotes: parsed.data.closureNotes?.trim() || undefined,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to update the handover record.",
    };
  }

  revalidatePath("/handover");

  return {
    message: `Handover updated by ${session.name}.`,
  };
}
