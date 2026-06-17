import { listClients, listStages, listTasks, listUsers } from "@/lib/data-access";

import { GanttOverview } from "@/components/gantt/gantt-overview";

export default async function GanttPage() {
  const [clients, tasks, stages, users] = await Promise.all([
    listClients(),
    listTasks(),
    listStages(),
    listUsers(),
  ]);

  return <GanttOverview clients={clients} tasks={tasks} stages={stages} users={users} />;
}
