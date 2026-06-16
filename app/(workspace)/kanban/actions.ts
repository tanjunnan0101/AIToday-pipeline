"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { updateTaskStatus } from "@/lib/data-access";
import { taskStatuses } from "@/lib/domain";

const moveTaskSchema = z.object({
  taskId: z.string().min(1, "Task id is required."),
  status: z.enum(taskStatuses, "Task status is required."),
});

export async function moveTaskAction(input: { taskId: string; status: string }) {
  await requireSession();

  const parsed = moveTaskSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Unable to move task.");
  }

  await updateTaskStatus(parsed.data);

  revalidatePath("/kanban");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
