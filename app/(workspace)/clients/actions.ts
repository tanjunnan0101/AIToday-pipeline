"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { clientStatuses } from "@/lib/domain";
import { createClientWithStages } from "@/lib/data-access";

const createClientSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  uen: z.string().min(4, "UEN is required."),
  industry: z.string().min(2, "Industry is required."),
  projectValue: z.coerce.number().positive("Project value must be greater than 0."),
  grantType: z.string().min(2, "Grant type is required."),
  status: z.enum(clientStatuses, "Client status is required."),
  accountOwnerId: z.string().min(1, "Choose an owner."),
  startDate: z.string().min(1, "Start date is required."),
  targetHandoverDate: z.string().min(1, "Target handover date is required."),
  notes: z.string().trim(),
});

export type CreateClientFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createClientAction(
  _previousState: CreateClientFormState,
  formData: FormData,
) {
  const parsed = createClientSchema.safeParse({
    companyName: formData.get("companyName"),
    uen: formData.get("uen"),
    industry: formData.get("industry"),
    projectValue: formData.get("projectValue"),
    grantType: formData.get("grantType"),
    status: formData.get("status"),
    accountOwnerId: formData.get("accountOwnerId"),
    startDate: formData.get("startDate"),
    targetHandoverDate: formData.get("targetHandoverDate"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const client = await createClientWithStages(parsed.data);

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect(`/clients/${client.id}`);
}
