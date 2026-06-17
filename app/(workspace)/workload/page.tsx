import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { listTasks, listTimeLogs, listUsers } from "@/lib/data-access";
import { formatHours, formatPercent } from "@/lib/utils";

export default async function WorkloadPage() {
  const [tasks, users, timeLogs] = await Promise.all([
    listTasks(),
    listUsers(),
    listTimeLogs(),
  ]);

  const team = users
    .filter((user) => user.role !== "CLIENT_VIEWER")
    .map((user) => {
      const ownedTasks = tasks.filter((task) => task.primaryOwnerId === user.id);
      const supportingTasks = tasks.filter((task) => task.supportingMemberIds.includes(user.id));
      const assignedTasks = tasks.filter(
        (task) =>
          task.primaryOwnerId === user.id || task.supportingMemberIds.includes(user.id),
      );
      const blockedTasks = assignedTasks.filter((task) => task.blocker);
      const activeTasks = assignedTasks.filter((task) => task.status !== "COMPLETED");
      const actualHours = assignedTasks.reduce((sum, task) => sum + task.actualHours, 0);
      const estimatedHours = assignedTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      const loggedHours = timeLogs
        .filter((log) => log.userId === user.id)
        .reduce((sum, log) => sum + log.hours, 0);
      const utilisation =
        user.capacityHours === 0 ? 0 : (actualHours / user.capacityHours) * 100;
      const remainingHours = Math.max(estimatedHours - actualHours, 0);
      const averageProgress = assignedTasks.length
        ? Math.round(
            assignedTasks.reduce((sum, task) => sum + task.completionPercent, 0) /
              assignedTasks.length,
          )
        : 0;

      return {
        user,
        ownedTasks,
        supportingTasks,
        assignedTasks,
        blockedTasks,
        activeTasks,
        actualHours,
        estimatedHours,
        loggedHours,
        utilisation,
        remainingHours,
        averageProgress,
      };
    })
    .sort((left, right) => right.utilisation - left.utilisation);

  const overloadedCount = team.filter((entry) => entry.utilisation > 100).length;
  const blockedCoverage = team.reduce((sum, entry) => sum + entry.blockedTasks.length, 0);
  const totalLoggedHours = team.reduce((sum, entry) => sum + entry.loggedHours, 0);
  const remainingHours = team.reduce((sum, entry) => sum + entry.remainingHours, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Team members
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{team.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Internal operators currently modeled in the workspace.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Over capacity
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{overloadedCount}</p>
          <p className="mt-2 text-sm text-slate-600">
            Team members above 100% modelled utilisation.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Blocked coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{blockedCoverage}</p>
          <p className="mt-2 text-sm text-slate-600">
            Blocked assignments still sitting on the current roster.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Remaining effort
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatHours(remainingHours)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {formatHours(totalLoggedHours)} logged so far across the team.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader
            eyebrow="Team workload"
            title="Capacity and utilisation"
            body="Availability, ownership load, delivery risk, and remaining effort are laid out here for balancing decisions."
          />
          <div className="space-y-4">
            {team.map((entry) => (
              <div key={entry.user.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{entry.user.name}</p>
                      <Badge tone={entry.utilisation > 100 ? "danger" : "info"}>
                        {entry.user.role.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {entry.assignedTasks.length} assignments | {entry.ownedTasks.length} owned |{" "}
                      {entry.supportingTasks.length} supporting
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={entry.blockedTasks.length ? "warning" : "success"}>
                      {entry.blockedTasks.length} blocked
                    </Badge>
                    <Badge tone={entry.activeTasks.length > 4 ? "warning" : "default"}>
                      {entry.activeTasks.length} active
                    </Badge>
                    <Badge tone={entry.utilisation > 100 ? "danger" : "info"}>
                      {formatPercent(entry.utilisation)}
                    </Badge>
                  </div>
                </div>

                <ProgressBar className="mt-4" value={Math.min(Math.round(entry.utilisation), 100)} />

                <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Capacity</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatHours(entry.user.capacityHours)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Actual</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatHours(entry.actualHours)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Remaining</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatHours(entry.remainingHours)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg progress</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatPercent(entry.averageProgress)}
                    </p>
                  </div>
                </div>

                {entry.blockedTasks.length ? (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-medium">Blocked items:</p>
                    <p className="mt-1">
                      {entry.blockedTasks.map((task) => task.title).join(" | ")}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              eyebrow="Balancing"
              title="Resourcing signals"
              body="These are the quickest levers to pull when delivery starts bunching up."
            />
            <div className="space-y-3">
              {team.slice(0, 4).map((entry) => (
                <div key={entry.user.id} className="rounded-2xl border border-slate-200/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{entry.user.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatPercent(entry.utilisation)} utilisation
                      </p>
                    </div>
                    <Badge tone={entry.utilisation > 100 ? "danger" : "info"}>
                      {entry.activeTasks.length} active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Time pulse"
              title="Logged effort"
              body="A quick read on who is actually burning hours in the current model."
            />
            <div className="space-y-3">
              {team.map((entry) => (
                <div key={entry.user.id} className="rounded-2xl border border-slate-200/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{entry.user.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatHours(entry.loggedHours)} logged via time entries
                      </p>
                    </div>
                    <Badge tone={entry.loggedHours > entry.user.capacityHours ? "warning" : "default"}>
                      {formatHours(entry.user.capacityHours)} capacity
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
