"use client";

import { useActionState } from "react";

import {
  createGrantAction,
  createInvoiceAction,
  createProposalAction,
  type CommercialFormState,
} from "@/app/(workspace)/clients/commercial-actions";
import {
  approvalStatuses,
  paymentStatuses,
  taskStatuses,
  type DocumentRecord,
} from "@/lib/domain";

const initialState: CommercialFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function ProposalForm({
  clientId,
  documents,
}: {
  clientId: string;
  documents: DocumentRecord[];
}) {
  const [state, formAction, pending] = useActionState(createProposalAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <input name="clientId" type="hidden" value={clientId} />
      <label className="block text-sm text-slate-700">
        Proposal document
        <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="documentId">
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name} ({document.version})
            </option>
          ))}
        </select>
        <FieldError errors={state.fieldErrors?.documentId} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Sent date
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="2026-06-16" name="sentDate" type="date" />
          <FieldError errors={state.fieldErrors?.sentDate} />
        </label>
        <label className="block text-sm text-slate-700">
          Approval
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="DRAFT" name="approvalStatus">
            {approvalStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-slate-700">
        Client comments
        <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="clientComments" />
      </label>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
      <button className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Add Proposal"}
      </button>
    </form>
  );
}

export function InvoiceForm({
  clientId,
  documents,
}: {
  clientId: string;
  documents: DocumentRecord[];
}) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <input name="clientId" type="hidden" value={clientId} />
      <label className="block text-sm text-slate-700">
        Invoice document
        <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="documentId">
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.name} ({document.version})
            </option>
          ))}
        </select>
        <FieldError errors={state.fieldErrors?.documentId} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Invoice number
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="invoiceNumber" placeholder="INV-2026-200" />
        </label>
        <label className="block text-sm text-slate-700">
          Amount
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="10000" min="1" name="amount" step="100" type="number" />
        </label>
        <label className="block text-sm text-slate-700">
          Status
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="ISSUED" name="status">
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Sent date
          <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="2026-06-16" name="sentDate" type="date" />
        </label>
      </div>
      <label className="block text-sm text-slate-700">
        Remarks
        <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="remarks" />
      </label>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
      <button className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Add Invoice"}
      </button>
    </form>
  );
}

export function GrantForm({
  clientId,
  documents,
}: {
  clientId: string;
  documents: DocumentRecord[];
}) {
  const [state, formAction, pending] = useActionState(createGrantAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <input name="clientId" type="hidden" value={clientId} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Proposal document
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="proposalDocumentId">
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.name} ({document.version})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Invoice document
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="invoiceDocumentId">
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.name} ({document.version})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Submission status
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="NOT_STARTED" name="submissionStatus">
            {taskStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-slate-700">
          Approval status
          <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" defaultValue="DRAFT" name="approvalStatus">
            {approvalStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-slate-700">
        Submission readiness
        <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="submissionReadiness" />
      </label>
      <label className="block text-sm text-slate-700">
        Remarks
        <textarea className="mt-2 min-h-20 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none" name="remarks" />
      </label>
      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}
      <button className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Add Grant Record"}
      </button>
    </form>
  );
}
