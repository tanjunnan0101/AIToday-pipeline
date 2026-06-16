import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listDocuments, listTasks } from "@/lib/data-access";
import { filterPortalDocuments, filterPortalTasks } from "@/lib/permissions";

export default async function PortalPage() {
  const [allDocuments, allTasks] = await Promise.all([listDocuments(), listTasks()]);
  const documents = filterPortalDocuments(allDocuments);
  const tasks = filterPortalTasks(allTasks);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Client portal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Approved milestones and handover actions
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white text-slate-950">
            <CardHeader
              eyebrow="Approved files"
              title="Documents safe for client viewing"
            />
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold">{document.name}</p>
                  <div className="mt-3">
                    <Badge tone="success">{document.status.replaceAll("_", " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white text-slate-950">
            <CardHeader
              eyebrow="Client-facing roadmap"
              title="Visible milestones only"
            />
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {task.status.replaceAll("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
