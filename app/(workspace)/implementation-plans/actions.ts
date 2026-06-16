"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { createImplementationPlanRecord } from "@/lib/data-access";
import { approvalStatuses, implementationPlanStatuses } from "@/lib/domain";
import { demoStorageProvider } from "@/lib/services/storage";

const createImplementationPlanSchema = z.object({
  clientId: z.string().min(1, "Choose a client."),
  relatedStageId: z.string().min(1, "Choose a stage."),
  name: z.string().min(2, "Plan name is required."),
  version: z.string().min(1, "Version is required."),
  status: z.enum(implementationPlanStatuses, "Choose a plan status."),
  approvalStatus: z.enum(approvalStatuses, "Choose an approval status."),
  sourceType: z.enum(["FILE", "GOOGLE_DRIVE", "EXTERNAL_URL"]),
  sourceReference: z.string().trim(),
  remarks: z.string().trim(),
});

export type CreateImplementationPlanFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createImplementationPlanAction(
  _previousState: CreateImplementationPlanFormState,
  formData: FormData,
) {
  const session = await requireSession();
  const file = formData.get("file");
  const parsed = createImplementationPlanSchema.safeParse({
    clientId: formData.get("clientId"),
    relatedStageId: formData.get("relatedStageId"),
    name: formData.get("name"),
    version: formData.get("version"),
    status: formData.get("status"),
    approvalStatus: formData.get("approvalStatus"),
    sourceType: formData.get("sourceType"),
    sourceReference: formData.get("sourceReference") ?? "",
    remarks: formData.get("remarks") ?? "",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let sourceReference = parsed.data.sourceReference;

  if (parsed.data.sourceType === "FILE") {
    if (!(file instanceof File) || file.size === 0) {
      return {
        message: "Attach a file or switch the source type.",
        fieldErrors: {
          file: ["Attach a file to continue."],
        },
      };
    }

    const upload = await demoStorageProvider.upload({
      path: `clients/${parsed.data.clientId}/implementation-plans`,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });
    sourceReference = upload.publicUrl;
  } else if (!sourceReference) {
    return {
      message: "Add the Google Drive link or external URL.",
      fieldErrors: {
        sourceReference: ["Provide the plan link."],
      },
    };
  }

  try {
    await createImplementationPlanRecord({
      ...parsed.data,
      sourceReference,
      uploadedById: session.id,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Unable to create the implementation plan.",
    };
  }

  revalidatePath("/implementation-plans");
  revalidatePath("/clients");

  return {
    message: "Implementation plan recorded successfully.",
  };
}
