"use client";

import { useActionState, useMemo, useState } from "react";

import {
  updateGanttTaskAction,
  type UpdateGanttTaskFormState,
} from "@/app/(workspace)/gantt/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { Client, PipelineStage, Task, User } from "@/lib/domain";
import { cn, formatPercent } from "@/lib/utils";

const initialState: UpdateGanttTaskFormState = {};

const zoomOptions = [
  { value: "day", label: "Day", pixelsPerDay: 28 },
  { value: "week", label: "Week", pixelsPerDay: 14 },
  { value: "month", label: "Month", pixelsPerDay: 4 },
  { value: "quarter", label: "Quarter", pixelsPerDay: 2.5 },
  { value: "year", label: "Year", pixelsPerDay: 1.25 },
] as const;

type ZoomValue = (typeof zoomOptions)[number]["value"];

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dayDiff(start: Date, end: Date) {
  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-600">{errors[0]}</p>;
}

function TimelineTaskEditor({
  availableDependencies,
  task,
}: {
  availableDependencies: Task[];
  task: Task;
}) {
  const [state, formAction, pending] = useActionState(updateGanttTaskAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
      <input name="taskId" type="hidden" value={task.id} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="block text-sm text-slate-700">
          Start
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
            defaultValue={task.startDate}
            name="startDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </label>
        <label className="block text-sm text-slate-700">
          End
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
            defaultValue={task.endDate}
            name="endDate"
            type="date"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </label>
        <label className="block text-sm text-slate-700">
          Progress
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
            defaultValue={task.completionPercent}
            max={100}
            min={0}
            name="completionPercent"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.completionPercent} />
        </label>
        <label className="block text-sm text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
            defaultValue={task.status}
            name="status"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_ON_CLIENT">Waiting on Client</option>
            <option value="WAITING_ON_INTERNAL_REVIEW">Waiting on Internal Review</option>
            <option value="WAITING_ON_GRANT_APPROVAL">Waiting on Grant Approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>
        <label className="block text-sm text-slate-700">
          Dependencies
          <select
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
            defaultValue={task.dependencyIds}
            multiple
            name="dependencyIds"
          >
            {availableDependencies.map((dependency) => (
              <option key={dependency.id} value={dependency.id}>
                {dependency.title}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.dependencyIds} />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{state.message ?? "Update dates, progress, or dependencies."}</p>
        <button
          className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save timeline"}
        </button>
      </div>
    </form>
  );
}

export function GanttOverview({
  clients,
  tasks,
  stages,
  users,
}: {
  clients: Client[];
  tasks: Task[];
  stages: PipelineStage[];
  users: User[];
}) {
  const [zoom, setZoom] = useState<ZoomValue>("week");
  const [clientFilter, setClientFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const zoomConfig = zoomOptions.find((option) => option.value === zoom) ?? zoomOptions[1];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const stage = stages.find((entry) => entry.id === task.stageId);

      if (clientFilter !== "all" && task.clientId !== clientFilter) {
        return false;
      }
      if (assigneeFilter !== "all" && task.primaryOwnerId !== assigneeFilter) {
        return false;
      }
      if (stageFilter !== "all" && task.stageId !== stageFilter) {
        return false;
      }
      if (groupFilter !== "all" && stage?.timelineGroup !== groupFilter) {
        return false;
      }
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [
    assigneeFilter,
    clientFilter,
    groupFilter,
    priorityFilter,
    stageFilter,
    stages,
    statusFilter,
    tasks,
  ]);

  const sortedTasks = useMemo(
    () =>
      [...filteredTasks].sort((left, right) => {
        if (left.startDate === right.startDate) {
          return left.endDate.localeCompare(right.endDate);
        }
        return left.startDate.localeCompare(right.startDate);
      }),
    [filteredTasks],
  );

  const timelineBounds = useMemo(() => {
    if (!sortedTasks.length) {
      const today = new Date();
      return { min: today, max: today, totalDays: 1 };
    }

    const dates = sortedTasks.flatMap((task) => [toDate(task.startDate), toDate(task.endDate)]);
    const min = new Date(Math.min(...dates.map((date) => date.getTime())));
    const max = new Date(Math.max(...dates.map((date) => date.getTime())));
    const totalDays = Math.max(1, dayDiff(min, max) + 1);

    return { min, max, totalDays };
  }, [sortedTasks]);

  const timelineWidth = Math.max(
    720,
    timelineBounds.totalDays * zoomConfig.pixelsPerDay + 120,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="Global Gantt"
          title="Timeline hierarchy"
          body="Grouped by client, timeline group, and stage with live schedule, progress, and dependency editing."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <label className="block text-sm text-slate-700">
            Client
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setClientFilter(event.target.value)}
              value={clientFilter}
            >
              <option value="all">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Assignee
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setAssigneeFilter(event.target.value)}
              value={assigneeFilter}
            >
              <option value="all">All assignees</option>
              {users.filter((user) => user.role !== "CLIENT_VIEWER").map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Stage
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setStageFilter(event.target.value)}
              value={stageFilter}
            >
              <option value="all">All stages</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Group
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setGroupFilter(event.target.value)}
              value={groupFilter}
            >
              <option value="all">All groups</option>
              <option value="CLOSING_THE_CLIENT">Closing the Client</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="FINAL_HANDOVER">Final Handover</option>
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Status
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CLIENT">Waiting on Client</option>
              <option value="WAITING_ON_INTERNAL_REVIEW">Waiting on Internal Review</option>
              <option value="WAITING_ON_GRANT_APPROVAL">Waiting on Grant Approval</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Priority
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setPriorityFilter(event.target.value)}
              value={priorityFilter}
            >
              <option value="all">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Zoom
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none"
              onChange={(event) => setZoom(event.target.value as ZoomValue)}
              value={zoom}
            >
              {zoomOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Timeline"
          title="Grouped schedule"
          body={`${filteredTasks.length} tasks in view. Development remains limited to Client-Facing Roadmap and Internal Roadmap.`}
        />
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-50/70">
          <div className="min-w-[960px] p-4" style={{ width: timelineWidth + 320 }}>
            {sortedTasks.length ? (
              <div className="space-y-4">
                {sortedTasks.map((task) => {
                  const client = clients.find((entry) => entry.id === task.clientId);
                  const stage = stages.find((entry) => entry.id === task.stageId);
                  const owner = users.find((user) => user.id === task.primaryOwnerId);
                  const offsetDays = dayDiff(timelineBounds.min, toDate(task.startDate));
                  const durationDays = Math.max(
                    1,
                    dayDiff(toDate(task.startDate), toDate(task.endDate)) + 1,
                  );
                  const barLeft = offsetDays * zoomConfig.pixelsPerDay;
                  const barWidth = durationDays * zoomConfig.pixelsPerDay;
                  const availableDependencies = tasks.filter(
                    (candidate) =>
                      candidate.clientId === task.clientId && candidate.id !== task.id,
                  );

                  return (
                    <div key={task.id} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 xl:w-80">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {client?.companyName}
                          </p>
                          <p className="mt-2 font-semibold text-slate-950">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {stage?.timelineGroup.replaceAll("_", " ")} | {stage?.name}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone={task.blocker ? "danger" : "info"}>
                              {task.status.replaceAll("_", " ")}
                            </Badge>
                            <Badge tone="warning">{task.priority}</Badge>
                            <Badge>{owner?.name ?? "Unassigned"}</Badge>
                            <Badge>{formatPercent(task.completionPercent)}</Badge>
                          </div>
                        </div>
                        <div className="overflow-x-auto xl:flex-1">
                          <div
                            className="relative h-20 rounded-2xl border border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)]"
                            style={{
                              width: timelineWidth,
                              backgroundSize: `${zoomConfig.pixelsPerDay}px 100%`,
                            }}
                          >
                            <div className="absolute inset-x-0 top-2 flex justify-between px-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              <span>{timelineBounds.min.toISOString().slice(0, 10)}</span>
                              <span>{timelineBounds.max.toISOString().slice(0, 10)}</span>
                            </div>
                            <div
                              className={cn(
                                "absolute top-9 rounded-full bg-[linear-gradient(90deg,#0891b2,#22c55e)] shadow-sm",
                                task.blocker && "bg-[linear-gradient(90deg,#f97316,#ef4444)]",
                              )}
                              style={{
                                left: `${barLeft}px`,
                                width: `${Math.max(barWidth, zoomConfig.pixelsPerDay)}px`,
                                height: "18px",
                              }}
                            >
                              <div
                                className="h-full rounded-full bg-slate-950/20"
                                style={{ width: `${task.completionPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <TimelineTaskEditor
                        availableDependencies={availableDependencies}
                        task={task}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-600">
                No tasks match the current filters.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
