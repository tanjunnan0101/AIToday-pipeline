"use client";

import { useActionState } from "react";

import {
  updateImplementationPlanStatusAction,
  type PlanStatusFormState,
} from "@/app/(workspace)/implementation-plans/status-actions";
import { approvalStatuses, implementationPlanStatuses, type ImplementationPlan } from "@/lib/domain";

const initialState: PlanStatusFormState = {};

export function PlanStatusForm({ plan }: { plan: ImplementationPlan }) {
  const [state, formAction, pending] = useActionState(
    updateImplementationPlanStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-2xl border border-dashed border-slate-200/80 p-3">
      <input name="planId" type="hidden" value={plan.id} />
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        defaultValue={plan.status}
        name="status"
      >
        {implementationPlanStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
        defaultValue={plan.approvalStatus}
        name="approvalStatus"
      >
        {approvalStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      {state.message ? <p className="text-xs text-slate-600">{state.message}</p> : null}
      <button className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Saving..." : "Update plan"}
      </button>
    </form>
  );
}
