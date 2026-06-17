"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { updateNotificationReadState } from "@/lib/data-access";

const updateNotificationSchema = z.object({
  notificationId: z.string().min(1, "Notification id is required."),
  read: z.string().transform((value) => value === "true"),
});

export type UpdateNotificationFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateNotificationAction(
  _previousState: UpdateNotificationFormState,
  formData: FormData,
) {
  await requireInternalSession();

  const parsed = updateNotificationSchema.safeParse({
    notificationId: formData.get("notificationId"),
    read: formData.get("read"),
  });

  if (!parsed.success) {
    return {
      message: "Unable to update the notification.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateNotificationReadState(parsed.data);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to update the notification.",
    };
  }

  revalidatePath("/notifications");

  return {
    message: parsed.data.read ? "Notification marked as read." : "Notification marked as unread.",
  };
}
