"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { createTimeLogRecord } from "@/lib/data-access";

const createTimeLogSchema = z.object({
  clientId: z.string().min(1, "Choose a client."),
  stageId: z.string().min(1, "Choose a stage."),
  userId: z.string().min(1, "Choose a team member."),
  taskId: z.string().optional(),
  revalidateTarget: z.string().optional(),
  hours: z.coerce.number().positive("Hours must be greater than 0."),
  billable: z.boolean(),
  entryDate: z.string().min(1, "Entry date is required."),
  description: z.string().min(2, "Description is required."),
});

export type CreateTimeLogFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createTimeLogAction(
  _previousState: CreateTimeLogFormState,
  formData: FormData,
) {
  await requireSession();

  const parsed = createTimeLogSchema.safeParse({
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId"),
    userId: formData.get("userId"),
    taskId: formData.get("taskId") || undefined,
    revalidateTarget: formData.get("revalidateTarget") || undefined,
    hours: formData.get("hours"),
    billable: formData.get("billable") === "on",
    entryDate: formData.get("entryDate"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createTimeLogRecord(parsed.data);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to create the time log right now.",
    };
  }

  revalidatePath("/time-logs");
  revalidatePath("/dashboard");
  revalidatePath("/workload");
  revalidatePath("/tasks");
  revalidatePath("/reports");
  if (parsed.data.revalidateTarget) {
    revalidatePath(parsed.data.revalidateTarget);
  }

  return {
    message: "Time log created.",
  };
}
