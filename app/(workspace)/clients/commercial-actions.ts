"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireInternalSession } from "@/lib/auth";
import {
  createGrantRecord,
  createInvoiceRecord,
  createProposalRecord,
} from "@/lib/data-access";
import { approvalStatuses, paymentStatuses, taskStatuses } from "@/lib/domain";

const createProposalSchema = z.object({
  clientId: z.string().min(1, "Client id is required."),
  documentId: z.string().min(1, "Choose a document."),
  sentDate: z.string().min(1, "Sent date is required."),
  approvalStatus: z.enum(approvalStatuses, "Choose an approval status."),
  clientComments: z.string().trim(),
  approvedDate: z.string().optional(),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client id is required."),
  documentId: z.string().min(1, "Choose a document."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  status: z.enum(paymentStatuses, "Choose a payment status."),
  sentDate: z.string().min(1, "Sent date is required."),
  paidDate: z.string().optional(),
  remarks: z.string().trim(),
});

const createGrantSchema = z.object({
  clientId: z.string().min(1, "Client id is required."),
  proposalDocumentId: z.string().min(1, "Choose a proposal document."),
  invoiceDocumentId: z.string().min(1, "Choose an invoice document."),
  submissionReadiness: z.string().min(2, "Submission readiness is required."),
  submissionStatus: z.enum(taskStatuses, "Choose a submission status."),
  approvalStatus: z.enum(approvalStatuses, "Choose an approval status."),
  remarks: z.string().trim(),
});

export type CommercialFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createProposalAction(
  _previousState: CommercialFormState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = createProposalSchema.safeParse({
    clientId: formData.get("clientId"),
    documentId: formData.get("documentId"),
    sentDate: formData.get("sentDate"),
    approvalStatus: formData.get("approvalStatus"),
    clientComments: formData.get("clientComments") ?? "",
    approvedDate: formData.get("approvedDate") || undefined,
  });

  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createProposalRecord(parsed.data);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  revalidatePath("/clients");
  return { message: "Proposal recorded." };
}

export async function createInvoiceAction(
  _previousState: CommercialFormState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = createInvoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    documentId: formData.get("documentId"),
    invoiceNumber: formData.get("invoiceNumber"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    sentDate: formData.get("sentDate"),
    paidDate: formData.get("paidDate") || undefined,
    remarks: formData.get("remarks") ?? "",
  });

  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createInvoiceRecord(parsed.data);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  revalidatePath("/clients");
  return { message: "Invoice recorded." };
}

export async function createGrantAction(
  _previousState: CommercialFormState,
  formData: FormData,
) {
  await requireInternalSession();
  const parsed = createGrantSchema.safeParse({
    clientId: formData.get("clientId"),
    proposalDocumentId: formData.get("proposalDocumentId"),
    invoiceDocumentId: formData.get("invoiceDocumentId"),
    submissionReadiness: formData.get("submissionReadiness"),
    submissionStatus: formData.get("submissionStatus"),
    approvalStatus: formData.get("approvalStatus"),
    remarks: formData.get("remarks") ?? "",
  });

  if (!parsed.success) {
    return { message: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createGrantRecord(parsed.data);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  revalidatePath("/clients");
  return { message: "Grant record recorded." };
}
