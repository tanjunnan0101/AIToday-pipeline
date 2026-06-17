import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listDocuments, listTasks } from "@/lib/data-access";
import { filterPortalDocuments, filterPortalTasks } from "@/lib/permissions";
import { formatPercent } from "@/lib/utils";

export default async function PortalPage() {
  const [allDocuments, allTasks] = await Promise.all([listDocuments(), listTasks()]);
  const documents = filterPortalDocuments(allDocuments);
  const tasks = filterPortalTasks(allTasks);
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const averageProgress = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + task.completionPercent, 0) / tasks.length)
    : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Client portal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Approved milestones and handover actions
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            This portal shows only approved client-facing documents and visible roadmap items.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Approved files
            </p>
            <p className="mt-3 text-2xl font-semibold">{documents.length}</p>
          </Card>
          <Card className="bg-white text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Visible milestones
            </p>
            <p className="mt-3 text-2xl font-semibold">{tasks.length}</p>
          </Card>
          <Card className="bg-white text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Completed
            </p>
            <p className="mt-3 text-2xl font-semibold">{completedTasks}</p>
          </Card>
          <Card className="bg-white text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Average progress
            </p>
            <p className="mt-3 text-2xl font-semibold">{formatPercent(averageProgress)}</p>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white text-slate-950">
            <CardHeader
              eyebrow="Approved files"
              title="Documents safe for client viewing"
              body="Only portal-safe items appear here, based on client-facing status and approval rules."
            />
            <div className="space-y-3">
              {documents.length ? (
                documents.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{document.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {document.type.replaceAll("_", " ")} | {document.version}
                        </p>
                      </div>
                      <Badge tone="success">{document.status.replaceAll("_", " ")}</Badge>
                    </div>
                    {document.storageObjectPath ? (
                      <a
                        className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        href={`/api/documents/${document.id}/download`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View document
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No approved documents are available yet.
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white text-slate-950">
            <CardHeader
              eyebrow="Client-facing roadmap"
              title="Visible milestones only"
              body="Internal-only tasks, blockers, and private notes stay out of the client portal."
            />
            <div className="space-y-3">
              {tasks.length ? (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {task.status.replaceAll("_", " ")}
                        </p>
                      </div>
                      <Badge tone={task.status === "COMPLETED" ? "success" : "info"}>
                        {formatPercent(task.completionPercent)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Target window: {task.startDate} to {task.endDate}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No client-facing milestones are visible yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
