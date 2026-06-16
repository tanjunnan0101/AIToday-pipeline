import { Card, CardHeader } from "@/components/ui/card";
import { listTasks, listUsers } from "@/lib/data-access";
import { formatHours, formatPercent } from "@/lib/utils";

export default async function WorkloadPage() {
  const [tasks, users] = await Promise.all([listTasks(), listUsers()]);

  return (
    <Card>
      <CardHeader
        eyebrow="Team workload"
        title="Capacity and utilisation"
        body="Availability, active tasks, and overrun signals are modeled here for delivery balancing."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {users
          .filter((user) => user.role !== "CLIENT_VIEWER")
          .map((user) => {
            const assignedTasks = tasks.filter(
              (task) =>
                task.primaryOwnerId === user.id || task.supportingMemberIds.includes(user.id),
            );
            const actual = assignedTasks.reduce((sum, task) => sum + task.actualHours, 0);
            const utilisation = user.capacityHours === 0 ? 0 : (actual / user.capacityHours) * 100;

            return (
              <div key={user.id} className="rounded-2xl border border-slate-200/70 p-4">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <p className="mt-1 text-sm text-slate-600">{user.role.replaceAll("_", " ")}</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>{assignedTasks.length} assigned tasks</p>
                  <p>{formatHours(actual)} actual</p>
                  <p>{formatPercent(utilisation)} utilisation</p>
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
