import Link from "next/link";

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
import { formatCurrency } from "@/lib/utils";

const tabs = [
  "Overview",
  "Pipeline",
  "Gantt",
  "Kanban",
  "Tasks",
  "Implementation Plan",
  "Documents",
  "Proposals",
  "Invoices",
  "EDG Grant",
  "Time Logs",
  "Notes",
  "Handover",
  "Audit Log",
];

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
          body="This placeholder route is ready for real database data once Prisma and Supabase are configured."
        />
      </Card>
    );
  }

  const owner = users.find((user) => user.id === bundle.client?.accountOwnerId);

  return (
    <div className="space-y-6">
      <Card className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_rgba(255,255,255,0.92)_42%)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge tone="info">{bundle.client.status.replaceAll("_", " ")}</Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {bundle.client.companyName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {bundle.client.notes}
              </p>
            </div>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Owner</p>
              <p className="mt-2 font-semibold text-slate-950">{owner?.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Value</p>
              <p className="mt-2 font-semibold text-slate-950">
                {formatCurrency(bundle.client.projectValue)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Target handover</p>
              <p className="mt-2 font-semibold text-slate-950">
                {bundle.client.targetHandoverDate}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <span
            key={tab}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            {tab}
          </span>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader
            eyebrow="Pipeline"
            title="Nine-stage delivery model"
            body="Development is restricted to the two roadmap stages. Everything else stays in Closing or Final Handover."
          />
          <div className="space-y-4">
            {bundle.stages.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-slate-200/70 p-4"
              >
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
                <ProgressBar value={stage.progress} className="mt-4" />
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
              {bundle.implementationPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-200/70 p-4">
                  <p className="font-semibold text-slate-950">{plan.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan.version} · {plan.status.replaceAll("_", " ")}
                  </p>
                  <Link
                    href={`/implementation-plans/${plan.id}`}
                    className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                  >
                    Zoom Into Implementation Plan
                  </Link>
                </div>
              ))}
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
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-950">{contact.name}</p>
                    <p className="text-sm text-slate-600">{contact.role}</p>
                  </div>
                  <Badge tone={contact.portalAccess ? "success" : "default"}>
                    {contact.portalAccess ? "Portal access" : "Internal only"}
                  </Badge>
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
                <p className="mb-3 text-sm font-semibold text-slate-900">Proposals</p>
                <div className="space-y-3">
                  {bundle.proposals.map((proposal) => (
                    <div key={proposal.id} className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-950">{proposal.documentId}</p>
                      <p>{proposal.approvalStatus.replaceAll("_", " ")} | {proposal.sentDate}</p>
                    </div>
                  ))}
                  <ProposalForm clientId={bundle.client.id} documents={bundle.documents} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Invoices</p>
                <div className="space-y-3">
                  {bundle.invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-950">{invoice.invoiceNumber}</p>
                      <p>{invoice.status.replaceAll("_", " ")} | {formatCurrency(invoice.amount)}</p>
                    </div>
                  ))}
                  <InvoiceForm clientId={bundle.client.id} documents={bundle.documents} />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">EDG grants</p>
                <div className="space-y-3">
                  {bundle.grants.map((grant) => (
                    <div key={grant.id} className="rounded-2xl border border-slate-200/70 p-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-950">{grant.submissionStatus.replaceAll("_", " ")}</p>
                      <p>{grant.approvalStatus.replaceAll("_", " ")}</p>
                    </div>
                  ))}
                  <GrantForm clientId={bundle.client.id} documents={bundle.documents} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
