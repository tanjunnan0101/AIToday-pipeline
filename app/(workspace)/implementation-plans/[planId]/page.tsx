import { notFound } from "next/navigation";

import { PlanWorkspace } from "@/components/plans/plan-workspace";
import { getPlanWorkspaceById, listStages, listUsers } from "@/lib/data-access";

export default async function ImplementationPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const [workspace, users, stages] = await Promise.all([
    getPlanWorkspaceById(planId),
    listUsers(),
    listStages(),
  ]);

  if (!workspace.plan || !workspace.client) {
    notFound();
  }

  const client = workspace.client;
  const plan = workspace.plan;

  return (
    <PlanWorkspace
      stages={stages.filter((stage) => stage.clientId === client.id)}
      users={users}
      workspace={{ ...workspace, plan, client }}
    />
  );
}
