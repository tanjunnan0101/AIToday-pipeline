"use client";

import { useActionState } from "react";

import {
  createSubtaskAction,
  updateSubtaskAction,
  type SubtaskFormState,
} from "@/app/(workspace)/tasks/actions";
import { taskStatuses, type Subtask } from "@/lib/domain";

const initialState: SubtaskFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function SubtaskForm({
  taskId,
  subtask,
}: {
  taskId: string;
  subtask?: Subtask;
}) {
  const action = subtask ? updateSubtaskAction : createSubtaskAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4"
    >
      <input name="taskId" type="hidden" value={taskId} />
      {subtask ? <input name="subtaskId" type="hidden" value={subtask.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700 md:col-span-2">
          Subtask title
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.title}
            name="title"
            placeholder="Break the task into an executable work step"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </label>

        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.status ?? "NOT_STARTED"}
            name="status"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>

        <label className="block text-sm text-slate-700">
          Completion
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.completionPercent ?? 0}
            max="100"
            min="0"
            name="completionPercent"
            step="1"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.completionPercent} />
        </label>

        <label className="block text-sm text-slate-700">
          Start date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.startDate}
            name="startDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </label>

        <label className="block text-sm text-slate-700">
          End date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.endDate}
            name="endDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </label>

        <label className="block text-sm text-slate-700">
          Estimated hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.estimatedHours ?? 0}
            min="0"
            name="estimatedHours"
            step="0.5"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.estimatedHours} />
        </label>

        <label className="block text-sm text-slate-700">
          Actual hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={subtask?.actualHours ?? 0}
            min="0"
            name="actualHours"
            step="0.5"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.actualHours} />
        </label>
      </div>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? subtask
            ? "Saving subtask..."
            : "Creating subtask..."
          : subtask
            ? "Save Subtask"
            : "Add Subtask"}
      </button>
    </form>
  );
}
