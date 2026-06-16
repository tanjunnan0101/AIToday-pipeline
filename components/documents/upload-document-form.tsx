"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createDocumentAction,
  type CreateDocumentFormState,
} from "@/app/(workspace)/documents/actions";
import { documentStatuses, documentTypes, type Client, type PipelineStage } from "@/lib/domain";

const initialState: CreateDocumentFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function UploadDocumentForm({
  clients,
  stages,
}: {
  clients: Client[];
  stages: PipelineStage[];
}) {
  const [state, formAction, pending] = useActionState(createDocumentAction, initialState);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const availableStages = useMemo(
    () => stages.filter((stage) => stage.clientId === selectedClientId),
    [selectedClientId, stages],
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Client
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={selectedClientId}
            name="clientId"
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.clientId} />
        </label>

        <label className="block text-sm text-slate-700">
          Stage
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={availableStages[0]?.id}
            name="stageId"
          >
            {availableStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.stageId} />
        </label>

        <label className="block text-sm text-slate-700">
          Document name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="name"
            placeholder="Client-facing proposal v2"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="block text-sm text-slate-700">
          Version
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="v1"
            name="version"
          />
          <FieldError errors={state.fieldErrors?.version} />
        </label>

        <label className="block text-sm text-slate-700">
          Type
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="SUPPORTING_DOCUMENT"
            name="type"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.type} />
        </label>

        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="UPLOADED"
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
          File
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="file"
            type="file"
          />
          <FieldError errors={state.fieldErrors?.file} />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input className="size-4 rounded border border-slate-300" name="clientFacing" type="checkbox" />
        Visible in the client portal
      </label>

      <label className="block text-sm text-slate-700">
        Notes
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          name="notes"
          placeholder="Reviewer notes, context, or replacement details..."
        />
        <FieldError errors={state.fieldErrors?.notes} />
      </label>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Recording document..." : "Upload Document"}
      </button>
    </form>
  );
}
