import { Card, CardHeader } from "@/components/ui/card";
import { getReportsView } from "@/lib/data-access";

export default async function ReportsPage() {
  const reports = await getReportsView();

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          eyebrow="Reports"
          title="Coverage map"
          body="Reporting surfaces are organized around progress, time, blockers, and handover readiness."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            `${reports.metrics.totalClients} total clients`,
            `${reports.metrics.activeClients} active clients`,
            `${reports.metrics.blockedTasks} blocked tasks`,
            `${reports.metrics.overdueTasks} overdue tasks`,
            `${reports.metrics.missingDocuments} stages missing documents`,
            `${reports.workload.length} staffed contributors`,
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-700">
              {item}
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
