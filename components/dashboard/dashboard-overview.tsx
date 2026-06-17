import {
  AlertTriangle,
  BriefcaseBusiness,
  Clock3,
  FileWarning,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { getDashboardView } from "@/lib/data-access";
import { formatCurrency, formatHours } from "@/lib/utils";

export async function DashboardOverview() {
  const dashboard = await getDashboardView();
  const { metrics, recentTasks, clients } = dashboard;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          accent="linear-gradient(90deg,#0f766e,#22d3ee)"
          detail={`${metrics.totalClients} tracked accounts across closing, development, and handover`}
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          label="Active clients"
          value={String(metrics.activeClients)}
        />
        <MetricCard
          accent="linear-gradient(90deg,#dc2626,#fb923c)"
          detail="Immediate escalation candidates inside roadmap execution"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Blocked tasks"
          value={String(metrics.blockedTasks)}
        />
        <MetricCard
          accent="linear-gradient(90deg,#d97706,#facc15)"
          detail="Pipeline stages without a linked deliverable or support file"
          icon={<FileWarning className="h-5 w-5" />}
          label="Missing documents"
          value={String(metrics.missingDocuments)}
        />
        <MetricCard
          accent="linear-gradient(90deg,#4338ca,#06b6d4)"
          detail={`${formatHours(metrics.billableHours)} billable across current delivery motion`}
          icon={<Clock3 className="h-5 w-5" />}
          label="Logged hours"
          value={formatHours(metrics.totalHours)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Projects at risk"
            title="Operational heat map"
            body="The clean top-level view stays high level while detailed delivery pressure sits inside roadmap work and implementation plans."
          />
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                    <p className="text-sm text-slate-600">
                      {task.stageName} | {task.ownerName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={task.blocker ? "danger" : "info"}>
                      {task.status.replaceAll("_", " ")}
                    </Badge>
                    <Badge tone={task.priority === "URGENT" ? "danger" : "warning"}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {formatHours(task.actualHours)} of {formatHours(task.estimatedHours)}
                  </span>
                  <span>Due {task.endDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Finance pulse"
            title="Commercial snapshot"
            body="Proposal, invoice, and grant movement stay outside Development by design."
          />
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{client.companyName}</p>
                    <p className="mt-1 text-sm text-slate-600">{client.grantType}</p>
                  </div>
                  <Badge tone="success">{client.status.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(client.projectValue)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
