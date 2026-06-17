"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { createUserRecord, updateUserRecord } from "@/lib/data-access";
import { userRoles } from "@/lib/domain";

const createUserSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.email("Valid email is required."),
  role: z.enum(userRoles, "Role is required."),
  capacityHours: z.coerce.number().min(0, "Capacity must be 0 or greater."),
});

const updateUserSchema = z.object({
  userId: z.string().min(1, "User id is required."),
  role: z.enum(userRoles, "Role is required."),
  capacityHours: z.coerce.number().min(0, "Capacity must be 0 or greater."),
});

export type UserAdminFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createUserAction(
  _previousState: UserAdminFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    capacityHours: formData.get("capacityHours"),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createUserRecord(parsed.data);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to create the user.",
    };
  }

  revalidatePath("/settings");

  return {
    message: `User created by ${session.name}.`,
  };
}

export async function updateUserAction(
  _previousState: UserAdminFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    capacityHours: formData.get("capacityHours"),
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateUserRecord(parsed.data);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to update the user.",
    };
  }

  revalidatePath("/settings");

  return {
    message: `User updated by ${session.name}.`,
  };
}
