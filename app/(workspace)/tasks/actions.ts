"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { createTaskRecord, deleteTaskRecord, updateTaskRecord } from "@/lib/data-access";
import { priorities, taskStatuses } from "@/lib/domain";

const createTaskSchema = z.object({
  clientId: z.string().min(1, "Choose a client."),
  stageId: z.string().min(1, "Choose a stage."),
  implementationPlanId: z.string().optional(),
  title: z.string().min(2, "Task title is required."),
  description: z.string().trim(),
  status: z.enum(taskStatuses, "Choose a task status."),
  priority: z.enum(priorities, "Choose a priority."),
  primaryOwnerId: z.string().min(1, "Choose a primary owner."),
  supportingMemberIds: z.array(z.string()).default([]),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  estimatedHours: z.coerce.number().min(0, "Estimated hours must be 0 or greater."),
  actualHours: z.coerce.number().min(0, "Actual hours must be 0 or greater."),
  dependencyIds: z.array(z.string()).default([]),
  blocker: z.boolean(),
  clientFacing: z.boolean(),
});

const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().min(1, "Task id is required."),
});

const deleteTaskSchema = z.object({
  taskId: z.string().min(1, "Task id is required."),
});

export type CreateTaskFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createTaskAction(
  _previousState: CreateTaskFormState,
  formData: FormData,
) {
  const session = await requireSession();

  const parsed = createTaskSchema.safeParse({
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId"),
    implementationPlanId: formData.get("implementationPlanId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
    primaryOwnerId: formData.get("primaryOwnerId"),
    supportingMemberIds: formData.getAll("supportingMemberIds").map(String),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    estimatedHours: formData.get("estimatedHours") ?? 0,
    actualHours: formData.get("actualHours") ?? 0,
    dependencyIds: formData.getAll("dependencyIds").map(String),
    blocker: formData.get("blocker") === "on",
    clientFacing: formData.get("clientFacing") === "on",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createTaskRecord(parsed.data);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to create the task right now.",
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/clients");

  if (parsed.data.implementationPlanId) {
    revalidatePath(`/implementation-plans/${parsed.data.implementationPlanId}`);
  }

  return {
    message: `Task created by ${session.name}.`,
  };
}

export async function updateTaskAction(
  _previousState: CreateTaskFormState,
  formData: FormData,
) {
  const session = await requireSession();

  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId"),
    implementationPlanId: formData.get("implementationPlanId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    priority: formData.get("priority"),
    primaryOwnerId: formData.get("primaryOwnerId"),
    supportingMemberIds: formData.getAll("supportingMemberIds").map(String),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    estimatedHours: formData.get("estimatedHours") ?? 0,
    actualHours: formData.get("actualHours") ?? 0,
    dependencyIds: formData.getAll("dependencyIds").map(String),
    blocker: formData.get("blocker") === "on",
    clientFacing: formData.get("clientFacing") === "on",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateTaskRecord(parsed.data);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to update the task right now.",
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/clients");

  if (parsed.data.implementationPlanId) {
    revalidatePath(`/implementation-plans/${parsed.data.implementationPlanId}`);
  }

  return {
    message: `Task updated by ${session.name}.`,
  };
}

export async function deleteTaskAction(taskId: string) {
  await requireSession();

  const parsed = deleteTaskSchema.safeParse({ taskId });
  if (!parsed.success) {
    throw new Error("Unable to delete task.");
  }

  await deleteTaskRecord(parsed.data.taskId);

  revalidatePath("/tasks");
  revalidatePath("/kanban");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
}
