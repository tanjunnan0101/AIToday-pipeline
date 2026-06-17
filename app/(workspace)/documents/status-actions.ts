"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { updateDocumentStatusRecord } from "@/lib/data-access";
import { documentStatuses } from "@/lib/domain";

const schema = z.object({
  documentId: z.string().min(1),
  status: z.enum(documentStatuses),
});

export type DocumentStatusFormState = {
  message?: string;
};

export async function updateDocumentStatusAction(
  _previousState: DocumentStatusFormState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = schema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { message: "Invalid status update." };
  }
  await updateDocumentStatusRecord(parsed.data);
  revalidatePath("/documents");
  revalidatePath("/portal");
  return { message: "Document status updated." };
}
