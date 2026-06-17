import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EntityCommentForm } from "@/components/comments/entity-comment-form";
import { ReplaceDocumentVersionForm } from "@/components/documents/replace-document-version-form";
import { DocumentStatusForm } from "@/components/documents/document-status-form";
import { UploadDocumentForm } from "@/components/documents/upload-document-form";
import { listClients, listComments, listDocuments, listStages, listUsers } from "@/lib/data-access";

export default async function DocumentsPage() {
  const [documents, clients, stages, comments, users] = await Promise.all([
    listDocuments(),
    listClients(),
    listStages(),
    listComments(),
    listUsers(),
  ]);

  const clientFacingCount = documents.filter((document) => document.clientFacing).length;
  const internalCount = documents.length - clientFacingCount;
  const fileBackedCount = documents.filter((document) => document.storageObjectPath).length;
  const approvedCount = documents.filter(
    (document) => document.status === "APPROVED" || document.status === "CLIENT_APPROVED",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Registered files
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{documents.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Versioned document records currently tracked in the workspace.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Client-facing
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{clientFacingCount}</p>
          <p className="mt-2 text-sm text-slate-600">
            {internalCount} internal-only files remain hidden from the portal.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Storage-backed
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{fileBackedCount}</p>
          <p className="mt-2 text-sm text-slate-600">
            Documents already carrying a downloadable current version.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Approved
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{approvedCount}</p>
          <p className="mt-2 text-sm text-slate-600">
            Files already cleared for internal or client-approved usage.
          </p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card>
          <CardHeader
            eyebrow="Upload document"
            title="Create a versioned record"
            body="Uploads write versioned document files through the server-side storage layer and keep portal visibility under document-level control."
          />
          <UploadDocumentForm clients={clients} stages={stages} />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Document management"
            title="Versioned files"
            body="Documents can be linked to clients, stages, tasks, and implementation plans with portal visibility control."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {documents.length ? (
              documents.map((document) => {
                const client = clients.find((entry) => entry.id === document.clientId);
                const stage = stages.find((entry) => entry.id === document.stageId);

                return (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-slate-200/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{document.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {document.type.replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="info">{document.status.replaceAll("_", " ")}</Badge>
                        <Badge tone={document.clientFacing ? "success" : "default"}>
                          {document.clientFacing ? "Client facing" : "Internal"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-900">Version:</span> {document.version}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Client:</span>{" "}
                        {client?.companyName ?? document.clientId}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Stage:</span>{" "}
                        {stage?.name ?? document.stageId ?? "Not linked"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Uploaded:</span>{" "}
                        {document.uploadedAt}
                      </p>
                    </div>

                    <div className="mt-4">
                      {document.storageObjectPath ? (
                        <a
                          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                          href={`/api/documents/${document.id}/download`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open current file
                        </a>
                      ) : (
                        <p className="text-sm text-slate-500">No file link available yet.</p>
                      )}
                    </div>

                    <DocumentStatusForm document={document} />

                    <div className="mt-4">
                      <details className="rounded-2xl bg-slate-50/80 p-2">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">
                          Replace document version
                        </summary>
                        <div className="mt-3">
                          <ReplaceDocumentVersionForm document={document} />
                        </div>
                      </details>
                    </div>

                    <details className="mt-4 rounded-2xl bg-slate-50/80 p-2">
                      <summary className="cursor-pointer text-sm font-medium text-slate-700">
                        Comments ({comments.filter((comment) => comment.entityType === "DOCUMENT" && comment.entityId === document.id).length})
                      </summary>
                      <div className="mt-3 space-y-3">
                        <EntityCommentForm
                          entityId={document.id}
                          entityType="DOCUMENT"
                          revalidateTarget="/documents"
                        />
                        {comments
                          .filter(
                            (comment) =>
                              comment.entityType === "DOCUMENT" && comment.entityId === document.id,
                          )
                          .map((comment) => {
                            const author = users.find((user) => user.id === comment.authorId);
                            return (
                              <div key={comment.id} className="rounded-2xl border border-slate-200/70 p-3 text-sm">
                                <p className="font-medium text-slate-950">{author?.name ?? "Unknown user"}</p>
                                <p className="mt-1 text-slate-600">{comment.message}</p>
                              </div>
                            );
                          })}
                      </div>
                    </details>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200/80 p-5 text-sm text-slate-500 md:col-span-2">
                No documents have been recorded yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
