"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";

import {
  createTaskAction,
  type CreateTaskFormState,
  updateTaskAction,
} from "@/app/(workspace)/tasks/actions";
import {
  priorities,
  taskStatuses,
  type Client,
  type PipelineStage,
  type Task,
  type User,
} from "@/lib/domain";

const initialState: CreateTaskFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function CreateTaskForm({
  clients,
  stages,
  tasks,
  users,
  lockedClientId,
  implementationPlanId,
  defaultStageId,
  mode = "create",
  task,
}: {
  clients: Client[];
  stages: PipelineStage[];
  tasks: Task[];
  users: User[];
  lockedClientId?: string;
  implementationPlanId?: string;
  defaultStageId?: string;
  mode?: "create" | "edit";
  task?: Task;
}) {
  const action = mode === "edit" ? updateTaskAction : createTaskAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedClientId, setSelectedClientId] = useState(
    lockedClientId ?? task?.clientId ?? clients[0]?.id ?? "",
  );
  const availableStages = useMemo(
    () => stages.filter((stage) => stage.clientId === selectedClientId),
    [selectedClientId, stages],
  );
  const availableDependencies = useMemo(
    () =>
      tasks.filter(
        (entry) => entry.clientId === selectedClientId && (!task || entry.id !== task.id),
      ),
    [selectedClientId, task, tasks],
  );

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && task ? <input name="taskId" type="hidden" value={task.id} /> : null}
      {implementationPlanId ? (
        <input name="implementationPlanId" type="hidden" value={implementationPlanId} />
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
            key={selectedClientId}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.stageId ?? defaultStageId ?? availableStages[0]?.id}
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

        <label className="block text-sm text-slate-700 md:col-span-2">
          Task title
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="title"
            defaultValue={task?.title}
            placeholder="Coordinate roadmap sign-off and dependency review"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </label>

        <label className="block text-sm text-slate-700 md:col-span-2">
          Description
          <textarea
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="description"
            defaultValue={task?.description}
            placeholder="Capture the concrete delivery work, blockers, and owner context..."
          />
          <FieldError errors={state.fieldErrors?.description} />
        </label>

        <label className="block text-sm text-slate-700">
          Primary owner
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.primaryOwnerId ?? users[0]?.id}
            name="primaryOwnerId"
          >
            {users
              .filter((user) => user.role !== "CLIENT_VIEWER")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
          <FieldError errors={state.fieldErrors?.primaryOwnerId} />
        </label>

        <label className="block text-sm text-slate-700">
          Supporting members
          <select
            className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.supportingMemberIds}
            multiple
            name="supportingMemberIds"
          >
            {users
              .filter((user) => user.role !== "CLIENT_VIEWER")
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
          <FieldError errors={state.fieldErrors?.supportingMemberIds} />
        </label>

        <label className="block text-sm text-slate-700">
          Dependencies
          <select
            className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.dependencyIds}
            multiple
            name="dependencyIds"
          >
            {availableDependencies.map((dependencyTask) => (
              <option key={dependencyTask.id} value={dependencyTask.id}>
                {dependencyTask.title}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.dependencyIds} />
        </label>

        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.status ?? "NOT_STARTED"}
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
          Priority
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.priority ?? "MEDIUM"}
            name="priority"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.priority} />
        </label>

        <label className="block text-sm text-slate-700">
          Start date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.startDate || "2026-06-16"}
            name="startDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </label>

        <label className="block text-sm text-slate-700">
          End date
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.endDate || "2026-06-23"}
            name="endDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </label>

        <label className="block text-sm text-slate-700">
          Estimated hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={task?.estimatedHours ?? 4}
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
            defaultValue={task?.actualHours ?? 0}
            min="0"
            name="actualHours"
            step="0.5"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.actualHours} />
        </label>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-slate-700">
        <label className="flex items-center gap-3">
          <input
            className="size-4 rounded border border-slate-300"
            defaultChecked={task?.blocker}
            name="blocker"
            type="checkbox"
          />
          Mark as blocked
        </label>
        <label className="flex items-center gap-3">
          <input
            className="size-4 rounded border border-slate-300"
            defaultChecked={task?.clientFacing}
            name="clientFacing"
            type="checkbox"
          />
          Visible in client-facing views
        </label>
      </div>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? (mode === "edit" ? "Saving task..." : "Creating task...") : mode === "edit" ? "Save Task" : "Add Task"}
      </button>
    </form>
  );
}
