import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { PlanCommentForm } from "@/components/plans/plan-comment-form";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { CreateTimeLogForm } from "@/components/time-logs/create-time-log-form";
import type { PlanWorkspaceView } from "@/lib/data-access";
import type { Client, PipelineStage, User } from "@/lib/domain";

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

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Detailed Gantt + task table"
            title="Delegated execution"
            body="This is the intentional zoom layer for detailed operational work."
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
          <div className="space-y-4">
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
              eyebrow="Version history"
              title="Uploaded sources"
              body={`${workspace.plan.version} from ${workspace.plan.sourceType.toLowerCase().replace("_", " ")}`}
            />
            <div className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600">
              {workspace.plan.sourceReference}
            </div>
          </Card>

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
                    <p className="font-semibold text-slate-950">{author?.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{comment.message}</p>
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
