import { HandoverWorkspace } from "@/components/handover/handover-workspace";
import { listClients, listDocuments, listHandovers, listTasks } from "@/lib/data-access";

export default async function HandoverPage() {
  const [clients, handovers, tasks, documents] = await Promise.all([
    listClients(),
    listHandovers(),
    listTasks(),
    listDocuments(),
  ]);

  return (
    <HandoverWorkspace
      clients={clients}
      documents={documents}
      handovers={handovers}
      tasks={tasks}
    />
  );
}
