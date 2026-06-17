"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { updateContactPortalAccessRecord } from "@/lib/data-access";

const schema = z.object({
  contactId: z.string().min(1),
  portalAccess: z.string().transform((value) => value === "true"),
  clientId: z.string().min(1),
});

export type ContactPortalAccessState = {
  message?: string;
};

export async function updateContactPortalAccessAction(
  _previousState: ContactPortalAccessState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = schema.safeParse({
    contactId: formData.get("contactId"),
    portalAccess: formData.get("portalAccess"),
    clientId: formData.get("clientId"),
  });
  if (!parsed.success) {
    return { message: "Invalid portal access update." };
  }
  await updateContactPortalAccessRecord({
    contactId: parsed.data.contactId,
    portalAccess: parsed.data.portalAccess,
  });
  revalidatePath(`/clients/${parsed.data.clientId}`);
  revalidatePath("/settings");
  return { message: "Portal access updated." };
}
