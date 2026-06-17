import Link from "next/link";

import { UploadImplementationPlanForm } from "@/components/plans/upload-implementation-plan-form";
import { PlanStatusForm } from "@/components/plans/plan-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listClients, listImplementationPlans, listStages } from "@/lib/data-access";

export default async function ImplementationPlansPage() {
  const [plans, clients, stages] = await Promise.all([
    listImplementationPlans(),
    listClients(),
    listStages(),
  ]);

  const fileBackedPlans = plans.filter((plan) => plan.sourceType === "FILE").length;
  const approvedPlans = plans.filter(
    (plan) => plan.approvalStatus === "APPROVED" || plan.approvalStatus === "SENT",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Registered plans
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{plans.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Detailed delivery workspaces linked to roadmap execution.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            File-backed
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{fileBackedPlans}</p>
          <p className="mt-2 text-sm text-slate-600">
            Plans already connected to uploaded source files.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Client coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{clients.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Clients available for plan-linked delegated delivery.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Approved or sent
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{approvedPlans}</p>
          <p className="mt-2 text-sm text-slate-600">
            Plans already moving through review or client approval.
          </p>
        </Card>
      </section>

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
            {plans.length ? (
              plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-200/70 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{plan.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {plan.version} | {plan.sourceType.replaceAll("_", " ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="info">{plan.status.replaceAll("_", " ")}</Badge>
                      <Badge tone="warning">{plan.approvalStatus.replaceAll("_", " ")}</Badge>
                    </div>
                  </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{plan.remarks}</p>
                <PlanStatusForm plan={plan} />
                <Link
                  href={`/implementation-plans/${plan.id}`}
                    className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                  >
                    Zoom into implementation plan
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-5 text-sm text-slate-500 md:col-span-2">
                No implementation plans have been registered yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
