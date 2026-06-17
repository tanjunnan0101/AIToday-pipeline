"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import { updateImplementationPlanStatusRecord } from "@/lib/data-access";
import { approvalStatuses, implementationPlanStatuses } from "@/lib/domain";

const schema = z.object({
  planId: z.string().min(1),
  status: z.enum(implementationPlanStatuses),
  approvalStatus: z.enum(approvalStatuses),
});

export type PlanStatusFormState = {
  message?: string;
};

export async function updateImplementationPlanStatusAction(
  _previousState: PlanStatusFormState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = schema.safeParse({
    planId: formData.get("planId"),
    status: formData.get("status"),
    approvalStatus: formData.get("approvalStatus"),
  });
  if (!parsed.success) {
    return { message: "Invalid plan status update." };
  }
  await updateImplementationPlanStatusRecord(parsed.data);
  revalidatePath("/implementation-plans");
  revalidatePath(`/implementation-plans/${parsed.data.planId}`);
  return { message: "Plan status updated." };
}
