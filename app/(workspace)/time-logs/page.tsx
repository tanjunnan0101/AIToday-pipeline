import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { CreateTimeLogForm } from "@/components/time-logs/create-time-log-form";
import { listClients, listStages, listTasks, listTimeLogs, listUsers } from "@/lib/data-access";
import { formatHours } from "@/lib/utils";

export default async function TimeLogsPage() {
  const [timeLogs, users, clients, stages, tasks] = await Promise.all([
    listTimeLogs(),
    listUsers(),
    listClients(),
    listStages(),
    listTasks(),
  ]);

  const billableHours = timeLogs
    .filter((log) => log.billable)
    .reduce((sum, log) => sum + log.hours, 0);
  const nonBillableHours = timeLogs
    .filter((log) => !log.billable)
    .reduce((sum, log) => sum + log.hours, 0);
  const linkedTaskLogs = timeLogs.filter((log) => log.taskId).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Logged entries
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{timeLogs.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Delivery effort records currently captured in the workspace.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Billable hours
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{formatHours(billableHours)}</p>
          <p className="mt-2 text-sm text-slate-600">
            {formatHours(nonBillableHours)} non-billable time logged separately.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Task-linked
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{linkedTaskLogs}</p>
          <p className="mt-2 text-sm text-slate-600">
            Entries already rolling actual hours into task progress.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Team coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {new Set(timeLogs.map((log) => log.userId)).size}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Contributors with recorded delivery time so far.
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card>
          <CardHeader
            eyebrow="Log time"
            title="Record delivery effort"
            body="Time entries now persist and roll task actual hours forward when linked to a task."
          />
          <CreateTimeLogForm clients={clients} stages={stages} tasks={tasks} users={users} />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Time tracking"
            title="Logged effort"
            body="Hours can be linked to clients, tasks, stages, and implementation-plan work."
          />
          <div className="space-y-3">
            {timeLogs.length ? (
              timeLogs.map((log) => {
                const user = users.find((entry) => entry.id === log.userId);
                const client = clients.find((entry) => entry.id === log.clientId);
                const stage = stages.find((entry) => entry.id === log.stageId);
                const task = tasks.find((entry) => entry.id === log.taskId);

                return (
                  <div key={log.id} className="rounded-2xl border border-slate-200/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {user?.name ?? "Unknown user"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{log.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={log.billable ? "success" : "default"}>
                          {log.billable ? "Billable" : "Non-billable"}
                        </Badge>
                        <Badge tone="info">{formatHours(log.hours)}</Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-900">Client:</span>{" "}
                        {client?.companyName ?? log.clientId}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Stage:</span>{" "}
                        {stage?.name ?? log.stageId}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Task:</span>{" "}
                        {task?.title ?? "Not linked"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Entry date:</span>{" "}
                        {log.entryDate}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-5 text-sm text-slate-500">
                No time logs recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
