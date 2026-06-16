"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createTimeLogAction,
  type CreateTimeLogFormState,
} from "@/app/(workspace)/time-logs/actions";
import type { Client, PipelineStage, Task, User } from "@/lib/domain";

const initialState: CreateTimeLogFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function CreateTimeLogForm({
  clients,
  stages,
  tasks,
  users,
  lockedClientId,
  lockedTaskId,
  defaultStageId,
  revalidateTarget,
}: {
  clients: Client[];
  stages: PipelineStage[];
  tasks: Task[];
  users: User[];
  lockedClientId?: string;
  lockedTaskId?: string;
  defaultStageId?: string;
  revalidateTarget?: string;
}) {
  const [state, formAction, pending] = useActionState(createTimeLogAction, initialState);
  const [selectedClientId, setSelectedClientId] = useState(lockedClientId ?? clients[0]?.id ?? "");
  const availableStages = useMemo(
    () => stages.filter((stage) => stage.clientId === selectedClientId),
    [selectedClientId, stages],
  );
  const availableTasks = useMemo(
    () => tasks.filter((task) => task.clientId === selectedClientId),
    [selectedClientId, tasks],
  );

  return (
    <form action={formAction} className="space-y-4">
      {revalidateTarget ? (
        <input name="revalidateTarget" type="hidden" value={revalidateTarget} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Client
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={selectedClientId}
            disabled={Boolean(lockedClientId)}
            name="clientId"
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
          {lockedClientId ? <input name="clientId" type="hidden" value={lockedClientId} /> : null}
          <FieldError errors={state.fieldErrors?.clientId} />
        </label>

        <label className="block text-sm text-slate-700">
          Stage
          <select
            key={`stage-${selectedClientId}`}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={defaultStageId ?? availableStages[0]?.id}
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
          Team member
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={users.find((user) => user.role !== "CLIENT_VIEWER")?.id}
            name="userId"
          >
            {users
              .filter((user) => user.role !== "CLIENT_VIEWER")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
          <FieldError errors={state.fieldErrors?.userId} />
        </label>

        <label className="block text-sm text-slate-700">
          Linked task
          <select
            key={`task-${selectedClientId}`}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={lockedTaskId ?? ""}
            disabled={Boolean(lockedTaskId)}
            name="taskId"
          >
            <option value="">No linked task</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          {lockedTaskId ? <input name="taskId" type="hidden" value={lockedTaskId} /> : null}
          <FieldError errors={state.fieldErrors?.taskId} />
        </label>

        <label className="block text-sm text-slate-700">
          Hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="1"
            min="0.5"
            name="hours"
            step="0.5"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.hours} />
        </label>

        <label className="block text-sm text-slate-700">
          Entry date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="2026-06-16"
            name="entryDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.entryDate} />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Description
          <textarea
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="description"
            placeholder="Describe the work completed during this time block..."
          />
          <FieldError errors={state.fieldErrors?.description} />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input className="size-4 rounded border border-slate-300" defaultChecked name="billable" type="checkbox" />
        Billable work
      </label>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Logging time..." : "Log Time"}
      </button>
    </form>
  );
}
