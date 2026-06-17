import { notFound } from "next/navigation";

import { GanttOverview } from "@/components/gantt/gantt-overview";
import { getClientBundleById, listUsers } from "@/lib/data-access";

export default async function ClientGanttPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [bundle, users] = await Promise.all([getClientBundleById(clientId), listUsers()]);

  if (!bundle.client) {
    notFound();
  }

  return (
    <GanttOverview
      clients={[bundle.client]}
      stages={bundle.stages}
      tasks={bundle.tasks}
      users={users}
    />
  );
}
