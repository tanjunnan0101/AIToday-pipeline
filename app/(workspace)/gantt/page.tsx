import { listStages, listTasks, listUsers } from "@/lib/data-access";

import { GanttOverview } from "@/components/gantt/gantt-overview";

export default async function GanttPage() {
  const [tasks, stages, users] = await Promise.all([
    listTasks(),
    listStages(),
    listUsers(),
  ]);

  return <GanttOverview tasks={tasks} stages={stages} users={users} />;
}
