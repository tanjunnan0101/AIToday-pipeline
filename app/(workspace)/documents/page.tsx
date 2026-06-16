import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ReplaceDocumentVersionForm } from "@/components/documents/replace-document-version-form";
import { UploadDocumentForm } from "@/components/documents/upload-document-form";
import { listClients, listDocuments, listStages } from "@/lib/data-access";

export default async function DocumentsPage() {
  const [documents, clients, stages] = await Promise.all([
    listDocuments(),
    listClients(),
    listStages(),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <Card>
        <CardHeader
          eyebrow="Upload document"
          title="Create a versioned record"
          body="This records document metadata now and is already shaped to switch to Supabase Storage once credentials are available."
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
          {documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-slate-200/70 p-4">
              <p className="font-semibold text-slate-950">{document.name}</p>
              <p className="mt-1 text-sm text-slate-600">{document.type.replaceAll("_", " ")}</p>
              <p className="mt-1 text-sm text-slate-500">Current version: {document.version}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="info">{document.status.replaceAll("_", " ")}</Badge>
                <Badge tone={document.clientFacing ? "success" : "default"}>
                  {document.clientFacing ? "Client facing" : "Internal"}
                </Badge>
              </div>
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
