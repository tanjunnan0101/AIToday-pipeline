import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { getReportsView } from "@/lib/data-access";
import { formatCurrency, formatHours } from "@/lib/utils";

function getStatusTone(value: string) {
  if (value === "COMPLETED" || value === "SIGNED" || value === "CLIENT_APPROVED") {
    return "success" as const;
  }

  if (value.includes("BLOCKED") || value.includes("OVERDUE")) {
    return "danger" as const;
  }

  if (value.includes("PENDING") || value.includes("SENT")) {
    return "warning" as const;
  }

  return "info" as const;
}

export default async function ReportsPage() {
  const reports = await getReportsView();
  const pendingHandovers = reports.handoverSummaries.filter(
    (handover) => handover.signOffStatus !== "COMPLETED" && handover.signOffStatus !== "ARCHIVED",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Active delivery
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {reports.metrics.activeClients}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {reports.metrics.totalClients} tracked accounts in the operating system.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Logged hours
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatHours(reports.metrics.totalHours)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {formatHours(reports.metrics.billableHours)} billable,{" "}
            {formatHours(reports.metrics.nonBillableHours)} non-billable.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Delivery risk
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {reports.metrics.blockedTasks}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {reports.metrics.overdueTasks} overdue tasks and {reports.metrics.missingDocuments} document gaps.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pending handover
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{pendingHandovers}</p>
          <p className="mt-2 text-sm text-slate-600">
            Sign-off workflows still active across final closure.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card>
          <CardHeader
            eyebrow="Reports"
            title="Client delivery matrix"
            body="This is the operating view for progress, blockers, client-facing document readiness, and handover posture."
          />
          <div className="space-y-4">
            {reports.clientSummaries.map((client) => (
              <div key={client.clientId} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{client.companyName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatCurrency(client.projectValue)} | {client.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={client.blockedTasks > 0 ? "danger" : "info"}>
                      {client.blockedTasks} blocked
                    </Badge>
                    <Badge tone={client.pendingClientDocuments > 0 ? "warning" : "success"}>
                      {client.pendingClientDocuments} pending docs
                    </Badge>
                    <Badge tone={getStatusTone(client.handoverStatus)}>
                      {client.handoverStatus.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
                <ProgressBar className="mt-4" value={client.completionPercent} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Workload"
            title="Owner coverage"
            body="This keeps resourcing pressure visible without dropping into task-level clutter."
          />
          <div className="space-y-3">
            {reports.workload.map((entry) => (
              <div key={entry.userId} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{entry.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {entry.role.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Badge tone={entry.blockedTasks > 0 ? "warning" : "info"}>
                    {entry.assignedTasks} assigned
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>{entry.blockedTasks} blocked tasks</span>
                  <span>{formatHours(entry.loggedHours)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <Card>
          <CardHeader
            eyebrow="Handover"
            title="Sign-off readiness"
            body="Final closure now has enough shape to review as its own lane."
          />
          <div className="space-y-3">
            {reports.handoverSummaries.map((handover) => (
              <div key={handover.handoverId} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{handover.companyName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Walkthrough {handover.walkthroughDate}
                    </p>
                  </div>
                  <Badge tone={getStatusTone(handover.signOffStatus)}>
                    {handover.signOffStatus.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>{handover.checklistCount} checklist items</span>
                  <span>{handover.pendingActionsCount} pending actions</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Signed by {handover.signedBy ?? "pending client confirmation"}.
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Audit"
            title="Latest important changes"
            body="Permission-sensitive mutations are tracked for accountability."
          />
          <div className="space-y-3">
            {reports.auditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200/70 p-4">
                <p className="font-semibold text-slate-950">{log.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-slate-600">{log.createdAt}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {log.entityType} | {log.entityId}
                </p>
              </div>
            ))}
            {!reports.auditLogs.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
                No audit entries yet.
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
