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

  return (
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
          {timeLogs.map((log) => {
            const user = users.find((entry) => entry.id === log.userId);

            return (
              <div key={log.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{user?.name ?? "Unknown user"}</p>
                    <p className="text-sm text-slate-600">{log.description}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {formatHours(log.hours)} | {log.billable ? "Billable" : "Non-billable"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
