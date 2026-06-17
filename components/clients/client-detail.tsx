import Link from "next/link";

import { ContactPortalAccessForm } from "@/components/clients/contact-portal-access-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import {
  GrantForm,
  InvoiceForm,
  ProposalForm,
} from "@/components/clients/commercial-record-forms";
import { ProgressBar } from "@/components/ui/progress";
import type { ClientBundle } from "@/lib/data-access";
import type { User } from "@/lib/domain";
import { formatCurrency, formatHours, formatPercent } from "@/lib/utils";

export function ClientDetail({
  bundle,
  users,
}: {
  bundle: ClientBundle;
  users: User[];
}) {
  if (!bundle.client) {
    return (
      <Card>
        <CardHeader
          eyebrow="Not found"
          title="Client record unavailable"
          body="This client could not be found in the current workspace data source."
        />
      </Card>
    );
  }

  const client = bundle.client;
  const owner = users.find((user) => user.id === client.accountOwnerId);
  const completedStages = bundle.stages.filter((stage) => stage.status === "COMPLETED").length;
  const blockedStages = bundle.stages.filter((stage) => stage.blocker).length;
  const blockedTasks = bundle.tasks.filter((task) => task.blocker);
  const clientFacingDocuments = bundle.documents.filter((document) => document.clientFacing);
  const totalEstimatedHours = bundle.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActualHours = bundle.tasks.reduce((sum, task) => sum + task.actualHours, 0);
  const averageTaskProgress = bundle.tasks.length
    ? Math.round(
        bundle.tasks.reduce((sum, task) => sum + task.completionPercent, 0) /
          bundle.tasks.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_rgba(255,255,255,0.92)_42%)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge tone="info">{client.status.replaceAll("_", " ")}</Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {client.companyName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {client.notes}
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Owner</p>
              <p className="mt-2 font-semibold text-slate-950">{owner?.name ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Value</p>
              <p className="mt-2 font-semibold text-slate-950">
                {formatCurrency(client.projectValue)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Target handover
              </p>
              <p className="mt-2 font-semibold text-slate-950">
                {client.targetHandoverDate}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Stages complete
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {completedStages}/{bundle.stages.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Delivery blockers
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{blockedTasks.length}</p>
          <p className="mt-2 text-sm text-slate-600">{blockedStages} blocked stages in pipeline.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Task progress
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatPercent(averageTaskProgress)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Logged hours
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {formatHours(totalActualHours)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {formatHours(totalEstimatedHours)} estimated across delivery tasks.
          </p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader
            eyebrow="Workspace"
            title="Jump to working views"
            body="Use these to move straight into the operational surfaces for this client."
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/clients/${client.id}/gantt`}
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Open client Gantt
            </Link>
            <Link
              href="/kanban"
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Open Kanban
            </Link>
            <Link
              href="/documents"
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Open Documents
            </Link>
            <Link
              href="/handover"
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Open Handover
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Handover"
            title="Closure status"
            body="A quick pulse on whether this client is approaching sign-off cleanly."
          />
          {bundle.handover ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/70 p-4">
                <div>
                  <p className="font-semibold text-slate-950">
                    {bundle.handover.signOffStatus.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Walkthrough {bundle.handover.walkthroughDate}
                  </p>
                </div>
                <Badge
                  tone={
                    bundle.handover.signOffStatus === "COMPLETED" ||
                    bundle.handover.signOffStatus === "SIGNED"
                      ? "success"
                      : "warning"
                  }
                >
                  {bundle.handover.pendingActions.length} pending
                </Badge>
              </div>
              {bundle.handover.pendingActions.length ? (
                <div className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600">
                  {bundle.handover.pendingActions.join(" | ")}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
              No handover record yet for this client.
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Pipeline"
            title="Nine-stage delivery model"
            body="Development is restricted to the two roadmap stages. Everything else stays in Closing or Final Handover."
          />
          <div className="space-y-4">
            {bundle.stages.map((stage) => (
              <div key={stage.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{stage.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {stage.timelineGroup.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Badge tone={stage.blocker ? "danger" : "default"}>
                    {stage.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <ProgressBar className="mt-4" value={stage.progress} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              eyebrow="Implementation plans"
              title="Zoom workspaces"
              body="Most delegated delivery lives in the plan drill-down instead of the top-level pipeline."
            />
            <div className="space-y-4">
              {bundle.implementationPlans.length ? (
                bundle.implementationPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-slate-200/70 p-4">
                    <p className="font-semibold text-slate-950">{plan.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {plan.version} | {plan.status.replaceAll("_", " ")}
                    </p>
                    <Link
                      href={`/implementation-plans/${plan.id}`}
                      className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                    >
                      Zoom into implementation plan
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
                  No implementation plans linked to this client yet.
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Documents"
              title="Client-ready material"
              body="What this client can actually see and receive across delivery and handover."
            />
            <div className="space-y-3">
              {clientFacingDocuments.length ? (
                clientFacingDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-slate-200/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{document.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {document.type.replaceAll("_", " ")} | {document.version}
                        </p>
                      </div>
                      <Badge tone="success">{document.status.replaceAll("_", " ")}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
                  No client-facing documents have been uploaded yet.
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Contacts"
              title="Client access"
              body="Portal visibility is permission filtered and limited to approved content."
            />
            <div className="space-y-3">
              {bundle.contacts.map((contact) => (
                <div key={contact.id} className="rounded-2xl border border-slate-200/70 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-950">{contact.name}</p>
                      <p className="text-sm text-slate-600">{contact.role}</p>
                    </div>
                    <Badge tone={contact.portalAccess ? "success" : "default"}>
                      {contact.portalAccess ? "Portal access" : "Internal only"}
                    </Badge>
                  </div>
                  <ContactPortalAccessForm clientId={client.id} contact={contact} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Commercial records"
              title="Proposal, invoice, and grant tracking"
              body="These records stay outside Development and now persist directly against the client."
            />
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Delivery risks</p>
                <div className="space-y-3">
                  {blockedTasks.length ? (
                    blockedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm text-rose-800"
                      >
                        <p className="font-medium text-rose-900">{task.title}</p>
                        <p className="mt-1">
                          {task.status.replaceAll("_", " ")} |{" "}
                          {formatPercent(task.completionPercent)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600">
                      No blocked tasks on this client right now.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Proposals</p>
                <div className="space-y-3">
                  {bundle.proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600"
                    >
                      <p className="font-medium text-slate-950">{proposal.documentId}</p>
                      <p>
                        {proposal.approvalStatus.replaceAll("_", " ")} | {proposal.sentDate}
                      </p>
                    </div>
                  ))}
                  <ProposalForm clientId={client.id} documents={bundle.documents} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Invoices</p>
                <div className="space-y-3">
                  {bundle.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600"
                    >
                      <p className="font-medium text-slate-950">{invoice.invoiceNumber}</p>
                      <p>
                        {invoice.status.replaceAll("_", " ")} |{" "}
                        {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  ))}
                  <InvoiceForm clientId={client.id} documents={bundle.documents} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">EDG grants</p>
                <div className="space-y-3">
                  {bundle.grants.map((grant) => (
                    <div
                      key={grant.id}
                      className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600"
                    >
                      <p className="font-medium text-slate-950">
                        {grant.submissionStatus.replaceAll("_", " ")}
                      </p>
                      <p>{grant.approvalStatus.replaceAll("_", " ")}</p>
                    </div>
                  ))}
                  <GrantForm clientId={client.id} documents={bundle.documents} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
