"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { getTaskById, updateTaskTimelineRecord } from "@/lib/data-access";
import { taskStatuses } from "@/lib/domain";

const updateGanttTaskSchema = z
  .object({
    taskId: z.string().min(1, "Task id is required."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    completionPercent: z.coerce
      .number()
      .min(0, "Progress must be at least 0.")
      .max(100, "Progress cannot exceed 100."),
    status: z.enum(taskStatuses, "Status is required."),
    dependencyIds: z.array(z.string()).default([]),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "End date cannot be earlier than start date.",
    path: ["endDate"],
  });

export type UpdateGanttTaskFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateGanttTaskAction(
  _previousState: UpdateGanttTaskFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const parsed = updateGanttTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    completionPercent: formData.get("completionPercent"),
    status: formData.get("status"),
    dependencyIds: formData.getAll("dependencyIds").map(String),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const currentTask = await getTaskById(parsed.data.taskId);
  if (!currentTask) {
    return { message: "Task not found." };
  }

  try {
    await updateTaskTimelineRecord(parsed.data);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to update the timeline item.",
    };
  }

  revalidatePath("/gantt");
  revalidatePath("/tasks");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  if (currentTask.implementationPlanId) {
    revalidatePath(`/implementation-plans/${currentTask.implementationPlanId}`);
  }

  return {
    message: `Timeline updated by ${session.name}.`,
  };
}
