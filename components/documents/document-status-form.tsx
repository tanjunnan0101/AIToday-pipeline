"use client";

import { useActionState } from "react";

import {
  updateDocumentStatusAction,
  type DocumentStatusFormState,
} from "@/app/(workspace)/documents/status-actions";
import { documentStatuses, type DocumentRecord } from "@/lib/domain";

const initialState: DocumentStatusFormState = {};

export function DocumentStatusForm({ document }: { document: DocumentRecord }) {
  const [state, formAction, pending] = useActionState(updateDocumentStatusAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded-2xl border border-dashed border-slate-200/80 p-3">
      <input name="documentId" type="hidden" value={document.id} />
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        defaultValue={document.status}
        name="status"
      >
        {documentStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {state.message ? <p className="text-xs text-slate-600">{state.message}</p> : null}
      <button className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Update status"}
      </button>
    </form>
  );
}
