"use client";

import { useActionState } from "react";

import {
  replaceDocumentVersionAction,
  type CreateDocumentFormState,
} from "@/app/(workspace)/documents/actions";
import { documentStatuses, type DocumentRecord } from "@/lib/domain";

const initialState: CreateDocumentFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function ReplaceDocumentVersionForm({ document }: { document: DocumentRecord }) {
  const [state, formAction, pending] = useActionState(
    replaceDocumentVersionAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <input name="documentId" type="hidden" value={document.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Next version
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={document.version}
            name="version"
          />
          <FieldError errors={state.fieldErrors?.version} />
        </label>

        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={document.status}
            name="status"
          >
            {documentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Replacement file
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="file"
            type="file"
          />
          <FieldError errors={state.fieldErrors?.file} />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input
          className="size-4 rounded border border-slate-300"
          defaultChecked={document.clientFacing}
          name="clientFacing"
          type="checkbox"
        />
        Keep visible in the client portal
      </label>

      <label className="block text-sm text-slate-700">
        Notes
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          name="notes"
          placeholder="Summarise what changed in this version..."
        />
        <FieldError errors={state.fieldErrors?.notes} />
      </label>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Replacing version..." : "Replace Version"}
      </button>
    </form>
  );
}
