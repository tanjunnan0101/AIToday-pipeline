import { Card, CardHeader } from "@/components/ui/card";
import type { PipelineStage, Task, User } from "@/lib/domain";

export function GanttOverview({
  tasks,
  stages,
  users,
}: {
  tasks: Task[];
  stages: PipelineStage[];
  users: User[];
}) {
  return (
    <Card>
      <CardHeader
        eyebrow="Gantt adapter"
        title="Timeline hierarchy"
        body="This foundation uses a lightweight timeline board now, with a provider seam ready for DHTMLX Gantt or another compatible implementation later."
      />
      <div className="space-y-4">
        {tasks.map((task) => {
          const stage = stages.find((entry) => entry.id === task.stageId);
          const owner = users.find((user) => user.id === task.primaryOwnerId);

          return (
            <div key={task.id} className="grid gap-3 rounded-2xl border border-slate-200/70 p-4 md:grid-cols-[1.2fr_0.8fr_1.2fr]">
              <div>
                <p className="font-semibold text-slate-950">{task.title}</p>
                <p className="mt-1 text-sm text-slate-600">{stage?.name}</p>
              </div>
              <div className="text-sm text-slate-600">
                <p>{task.startDate}</p>
                <p>{task.endDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">{owner?.name}</p>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#0891b2,#22c55e)]"
                    style={{ width: `${task.completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
