"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { createDocumentRecord, replaceDocumentVersionRecord } from "@/lib/data-access";
import { documentStatuses, documentTypes } from "@/lib/domain";

const createDocumentSchema = z.object({
  clientId: z.string().min(1, "Choose a client."),
  stageId: z.string().optional(),
  name: z.string().min(2, "Document name is required."),
  type: z.enum(documentTypes, "Choose a document type."),
  status: z.enum(documentStatuses, "Choose a document status."),
  version: z.string().min(1, "Version is required."),
  notes: z.string().trim(),
  clientFacing: z.boolean(),
});

const replaceDocumentVersionSchema = z.object({
  documentId: z.string().min(1, "Document id is required."),
  version: z.string().min(1, "Version is required."),
  status: z.enum(documentStatuses, "Choose a document status."),
  notes: z.string().trim(),
  clientFacing: z.boolean(),
});

export type CreateDocumentFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createDocumentAction(
  _previousState: CreateDocumentFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const file = formData.get("file");
  const parsed = createDocumentSchema.safeParse({
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId") || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status"),
    version: formData.get("version"),
    notes: formData.get("notes") ?? "",
    clientFacing: formData.get("clientFacing") === "on",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Attach a file to create the document record.",
      fieldErrors: {
        file: ["Attach a file to continue."],
      },
    };
  }

  try {
    await createDocumentRecord({
      ...parsed.data,
      stageId: parsed.data.stageId || undefined,
      uploadedById: session.id,
      file,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to create the document right now.",
    };
  }

  revalidatePath("/documents");
  revalidatePath("/clients");
  revalidatePath("/portal");

  return {
    message: "Document recorded successfully.",
  };
}

export async function replaceDocumentVersionAction(
  _previousState: CreateDocumentFormState,
  formData: FormData,
) {
  const session = await requireInternalSession();
  const file = formData.get("file");
  const parsed = replaceDocumentVersionSchema.safeParse({
    documentId: formData.get("documentId"),
    version: formData.get("version"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? "",
    clientFacing: formData.get("clientFacing") === "on",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(file instanceof File) || file.size === 0) {
    return {
      message: "Attach a replacement file to create the next version.",
      fieldErrors: {
        file: ["Attach a replacement file to continue."],
      },
    };
  }

  try {
    await replaceDocumentVersionRecord({
      ...parsed.data,
      uploadedById: session.id,
      file,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to replace the document version right now.",
    };
  }

  revalidatePath("/documents");
  revalidatePath("/clients");
  revalidatePath("/portal");

  return {
    message: "Document version replaced successfully.",
  };
}
