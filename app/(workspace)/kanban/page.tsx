import { listTasks, listUsers } from "@/lib/data-access";

import { KanbanBoard } from "@/components/kanban/kanban-board";

export default async function KanbanPage() {
  const [tasks, users] = await Promise.all([listTasks(), listUsers()]);

  return <KanbanBoard tasks={tasks} users={users} />;
}
