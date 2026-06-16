"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createImplementationPlanAction,
  type CreateImplementationPlanFormState,
} from "@/app/(workspace)/implementation-plans/actions";
import {
  approvalStatuses,
  implementationPlanStatuses,
  type Client,
  type PipelineStage,
} from "@/lib/domain";

const initialState: CreateImplementationPlanFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function UploadImplementationPlanForm({
  clients,
  stages,
}: {
  clients: Client[];
  stages: PipelineStage[];
}) {
  const [state, formAction, pending] = useActionState(
    createImplementationPlanAction,
    initialState,
  );
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
          Related stage
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={availableStages[0]?.id}
            name="relatedStageId"
          >
            {availableStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.relatedStageId} />
        </label>

        <label className="block text-sm text-slate-700">
          Plan name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="name"
            placeholder="Internal roadmap handoff plan"
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
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="DRAFT"
            name="status"
          >
            {implementationPlanStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>

        <label className="block text-sm text-slate-700">
          Approval
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="DRAFT"
            name="approvalStatus"
          >
            {approvalStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.approvalStatus} />
        </label>

        <label className="block text-sm text-slate-700">
          Source type
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="FILE"
            name="sourceType"
          >
            <option value="FILE">File upload</option>
            <option value="GOOGLE_DRIVE">Google Drive link</option>
            <option value="EXTERNAL_URL">External URL</option>
          </select>
          <FieldError errors={state.fieldErrors?.sourceType} />
        </label>

        <label className="block text-sm text-slate-700">
          File
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="file"
            type="file"
          />
          <FieldError errors={state.fieldErrors?.file} />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Source reference
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="sourceReference"
            placeholder="https://drive.google.com/... or external source URL"
          />
          <FieldError errors={state.fieldErrors?.sourceReference} />
        </label>
      </div>

      <label className="block text-sm text-slate-700">
        Remarks
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          name="remarks"
          placeholder="Version notes, delegation context, or handoff remarks..."
        />
        <FieldError errors={state.fieldErrors?.remarks} />
      </label>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Recording plan..." : "Upload Implementation Plan"}
      </button>
    </form>
  );
}
