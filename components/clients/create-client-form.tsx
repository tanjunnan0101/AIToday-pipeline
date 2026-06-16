"use client";

import { useActionState } from "react";

import { createClientAction, type CreateClientFormState } from "@/app/(workspace)/clients/actions";
import { clientStatuses, type User } from "@/lib/domain";

const initialState: CreateClientFormState = {};

function FieldError({
  errors,
}: {
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function CreateClientForm({ owners }: { owners: User[] }) {
  const [state, formAction, pending] = useActionState(createClientAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Company name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="companyName"
            placeholder="AIToday client name"
          />
          <FieldError errors={state.fieldErrors?.companyName} />
        </label>
        <label className="block text-sm text-slate-700">
          UEN
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="uen"
            placeholder="201912345X"
          />
          <FieldError errors={state.fieldErrors?.uen} />
        </label>
        <label className="block text-sm text-slate-700">
          Industry
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="industry"
            placeholder="Retail, services, logistics..."
          />
          <FieldError errors={state.fieldErrors?.industry} />
        </label>
        <label className="block text-sm text-slate-700">
          Project value
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            min="1"
            name="projectValue"
            placeholder="50000"
            step="1000"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.projectValue} />
        </label>
        <label className="block text-sm text-slate-700">
          Grant type
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="grantType"
            placeholder="EDG"
          />
          <FieldError errors={state.fieldErrors?.grantType} />
        </label>
        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="LEAD"
            name="status"
          >
            {clientStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>
        <label className="block text-sm text-slate-700">
          Account owner
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={owners[0]?.id}
            name="accountOwnerId"
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.accountOwnerId} />
        </label>
        <label className="block text-sm text-slate-700">
          Start date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="2026-06-15"
            name="startDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </label>
        <label className="block text-sm text-slate-700">
          Target handover
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="2026-08-15"
            name="targetHandoverDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.targetHandoverDate} />
        </label>
      </div>

      <label className="block text-sm text-slate-700">
        Notes
        <textarea
          className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          name="notes"
          placeholder="Key delivery context, risks, or scope notes..."
        />
        <FieldError errors={state.fieldErrors?.notes} />
      </label>

      {state.message ? <p className="text-sm text-rose-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating client..." : "Add Client"}
      </button>
    </form>
  );
}
