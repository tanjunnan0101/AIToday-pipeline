import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { GanttOverview } from "@/components/gantt/gantt-overview";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ProgressBar } from "@/components/ui/progress";
import { PlanCommentForm } from "@/components/plans/plan-comment-form";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { CreateTimeLogForm } from "@/components/time-logs/create-time-log-form";
import type { PlanWorkspaceView } from "@/lib/data-access";
import type { Client, PipelineStage, User } from "@/lib/domain";
import { formatHours, formatPercent } from "@/lib/utils";

type ResolvedPlanWorkspace = PlanWorkspaceView & {
  client: NonNullable<PlanWorkspaceView["client"]>;
  plan: NonNullable<PlanWorkspaceView["plan"]>;
};

export function PlanWorkspace({
  workspace,
  stages,
  users,
}: {
  workspace: ResolvedPlanWorkspace;
  stages: PipelineStage[];
  users: User[];
}) {
  const allTasks = workspace.tasks;
  const completedTasks = allTasks.filter((task) => task.status === "COMPLETED").length;
  const blockedTasks = allTasks.filter((task) => task.blocker);
  const totalEstimatedHours = allTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActualHours = allTasks.reduce((sum, task) => sum + task.actualHours, 0);
  const averageProgress = allTasks.length
    ? Math.round(
        allTasks.reduce((sum, task) => sum + task.completionPercent, 0) / allTasks.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_rgba(255,255,255,0.92)_42%)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {workspace.client.companyName}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {workspace.plan.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              {workspace.plan.remarks}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{workspace.plan.status.replaceAll("_", " ")}</Badge>
            <Badge tone="warning">{workspace.plan.approvalStatus.replaceAll("_", " ")}</Badge>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Delegated tasks", value: `${allTasks.length}` },
          { label: "Completed", value: `${completedTasks}` },
          { label: "Blocked", value: `${blockedTasks.length}` },
          { label: "Avg progress", value: formatPercent(averageProgress) },
          { label: "Estimated", value: formatHours(totalEstimatedHours) },
          { label: "Actual", value: formatHours(totalActualHours) },
          {
            label: "Plan status",
            value: workspace.plan.status.replaceAll("_", " "),
          },
          {
            label: "Approval",
            value: workspace.plan.approvalStatus.replaceAll("_", " "),
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Overview"
            title="Plan execution summary"
            body="This workspace holds the detailed delegated work that stays out of the top-level client pipeline."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Related roadmap stage
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {stages.find((stage) => stage.id === workspace.plan.relatedStageId)?.name ??
                  workspace.plan.relatedStageId}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Upload date
              </p>
              <p className="mt-2 font-semibold text-slate-950">{workspace.plan.uploadDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Key blockers
              </p>
              {blockedTasks.length ? (
                <div className="mt-3 space-y-3">
                  {blockedTasks.map((task) => {
                    const owner = users.find((user) => user.id === task.primaryOwnerId);
                    return (
                      <div
                        key={task.id}
                        className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900"
                      >
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1">
                          Owner: {owner?.name ?? "Unassigned"} | Status:{" "}
                          {task.status.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-rose-800">
                          Impact: Delivery flow is constrained until this task is resolved.
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No active blockers in this plan.</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Version history"
            title="Uploaded sources"
            body={`${workspace.plan.version} from ${workspace.plan.sourceType.toLowerCase().replace("_", " ")}`}
          />
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600">
              {workspace.plan.sourceType === "FILE" ? (
                <a
                  className="font-medium text-slate-900 underline underline-offset-4"
                  href={`/api/implementation-plans/${workspace.plan.id}/source`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open source file
                </a>
              ) : (
                workspace.plan.sourceReference
              )}
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Current approval state
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="info">{workspace.plan.version}</Badge>
                <Badge tone="warning">
                  {workspace.plan.approvalStatus.replaceAll("_", " ")}
                </Badge>
                <Badge tone="default">{workspace.plan.status.replaceAll("_", " ")}</Badge>
              </div>
            </div>
            {workspace.documents.length ? (
              <div className="space-y-3">
                {workspace.documents.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600"
                  >
                    <p className="font-semibold text-slate-950">{document.name}</p>
                    <p className="mt-1">
                      {document.version} | {document.status.replaceAll("_", " ")}
                    </p>
                    {document.storageObjectPath ? (
                      <a
                        className="mt-3 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        href={`/api/documents/${document.id}/download`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open file
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Plan Gantt"
            title="Detailed schedule"
            body="Plan-scoped timeline for delegated tasks, dates, progress, and dependencies."
          />
          <GanttOverview
            clients={[workspace.client as Client]}
            stages={stages}
            tasks={workspace.tasks}
            users={users}
          />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Plan Kanban"
            title="Execution board"
            body="Detailed plan delivery can move independently of the top-level client board."
          />
          <KanbanBoard tasks={workspace.tasks} users={users} />
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Task table"
            title="Delegated execution"
            body="Create, review, and update detailed delegated work items inside the plan."
          />
          <div className="mb-6 rounded-2xl border border-dashed border-slate-200/80 p-4">
            <CreateTaskForm
              clients={[workspace.client as Client]}
              defaultStageId={workspace.plan.relatedStageId}
              implementationPlanId={workspace.plan.id}
              lockedClientId={workspace.client.id}
              stages={stages}
              tasks={allTasks}
              users={users}
            />
          </div>
          <div className="mb-6 rounded-2xl border border-dashed border-slate-200/80 p-4">
            <CreateTimeLogForm
              clients={[workspace.client as Client]}
              defaultStageId={workspace.plan.relatedStageId}
              lockedClientId={workspace.client.id}
              revalidateTarget={`/implementation-plans/${workspace.plan.id}`}
              stages={stages}
              tasks={allTasks}
              users={users}
            />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Dependencies</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {workspace.tasks.map((task) => {
                  const owner = users.find((user) => user.id === task.primaryOwnerId);
                  return (
                    <tr key={task.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">{task.title}</p>
                        <p className="mt-1 text-slate-600">{task.priority}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{owner?.name ?? "Unassigned"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {task.startDate} to {task.endDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatHours(task.actualHours)} / {formatHours(task.estimatedHours)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{task.dependencyIds.length}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={task.blocker ? "danger" : "info"}>
                            {task.status.replaceAll("_", " ")}
                          </Badge>
                          <Badge tone="default">{formatPercent(task.completionPercent)}</Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 space-y-4">
            {workspace.tasks.map((task) => {
              const owner = users.find((user) => user.id === task.primaryOwnerId);
              return (
                <div key={task.id} className="rounded-2xl border border-slate-200/70 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{owner?.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={task.blocker ? "danger" : "info"}>
                        {task.status.replaceAll("_", " ")}
                      </Badge>
                      <Badge tone="warning">{task.priority}</Badge>
                    </div>
                  </div>
                  <ProgressBar value={task.completionPercent} className="mt-4" />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              eyebrow="Comments"
              title="Operational blockers"
              body="Mentions, timestamps, and resolution context are scoped to the plan workspace."
            />
            <PlanCommentForm planId={workspace.plan.id} />
            <div className="space-y-4">
              {workspace.comments.map((comment) => {
                const author = users.find((user) => user.id === comment.authorId);
                return (
                  <div key={comment.id} className="rounded-2xl border border-slate-200/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-950">{author?.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {comment.createdAt.slice(0, 10)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{comment.message}</p>
                    <div className="mt-3">
                      <Badge tone={comment.clientFacing ? "success" : "default"}>
                        {comment.clientFacing ? "Client facing" : "Internal"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
