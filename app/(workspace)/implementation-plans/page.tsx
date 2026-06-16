import Link from "next/link";

import { UploadImplementationPlanForm } from "@/components/plans/upload-implementation-plan-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listClients, listImplementationPlans, listStages } from "@/lib/data-access";

export default async function ImplementationPlansPage() {
  const [plans, clients, stages] = await Promise.all([
    listImplementationPlans(),
    listClients(),
    listStages(),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <Card>
        <CardHeader
          eyebrow="Upload implementation plan"
          title="Seed the drill-down workspace"
          body="The plan registry now supports file-backed metadata, Google Drive links, and external source references."
        />
        <UploadImplementationPlanForm clients={clients} stages={stages} />
      </Card>

      <Card>
        <CardHeader
          eyebrow="Implementation plan drill-down"
          title="Zoom workspaces"
          body="Each upload becomes a dedicated operational workspace with detailed execution surfaces."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-slate-200/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{plan.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{plan.version}</p>
                </div>
                <Badge tone="info">{plan.status.replaceAll("_", " ")}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.remarks}</p>
              <Link
                href={`/implementation-plans/${plan.id}`}
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                Zoom Into Implementation Plan
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
