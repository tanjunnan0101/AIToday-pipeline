"use client";

import { useActionState } from "react";

import {
  updateHandoverAction,
  type UpdateHandoverFormState,
} from "@/app/(workspace)/handover/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { Client, DocumentRecord, HandoverRecord, Task } from "@/lib/domain";
import { formatPercent } from "@/lib/utils";

const initialState: UpdateHandoverFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

function getStatusTone(status: HandoverRecord["signOffStatus"]) {
  if (status === "SIGNED" || status === "COMPLETED") {
    return "success" as const;
  }

  if (status === "PENDING_CLIENT_SIGNATURE" || status === "SENT_TO_CLIENT") {
    return "warning" as const;
  }

  if (status === "ARCHIVED") {
    return "default" as const;
  }

  return "info" as const;
}

function HandoverEditor({
  handover,
  client,
  tasks,
  documents,
}: {
  handover: HandoverRecord;
  client?: Client;
  tasks: Task[];
  documents: DocumentRecord[];
}) {
  const [state, formAction, pending] = useActionState(updateHandoverAction, initialState);
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;
  const blockedTasks = tasks.filter((task) => task.blocker).length;
  const averageProgress = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + task.completionPercent, 0) / tasks.length)
    : 0;
  const signOffDocuments = documents.filter((document) => document.type === "SIGN_OFF_DOCUMENT");
  const latestSignOffDocument = signOffDocuments[0];

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {client?.companyName ?? handover.clientId}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Handover workspace</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Close out walkthrough details, checklist items, pending client actions, and the
            final sign-off state from one place.
          </p>
        </div>
        <Badge tone={getStatusTone(handover.signOffStatus)}>
          {handover.signOffStatus.replaceAll("_", " ")}
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Walkthrough
          </p>
          <p className="mt-2 font-semibold text-slate-950">{handover.walkthroughDate}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Signed by
          </p>
          <p className="mt-2 font-semibold text-slate-950">{handover.signedBy ?? "Pending"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tasks done
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {completedTasks}/{tasks.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Avg progress
          </p>
          <p className="mt-2 font-semibold text-slate-950">{formatPercent(averageProgress)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Sign-off document
          </p>
          {latestSignOffDocument ? (
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{latestSignOffDocument.name}</p>
                <p className="text-sm text-slate-600">
                  {latestSignOffDocument.version} | {latestSignOffDocument.status.replaceAll("_", " ")}
                </p>
              </div>
              {latestSignOffDocument.storageObjectPath ? (
                <a
                  className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  href={`/api/documents/${latestSignOffDocument.id}/download`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open sign-off file
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No sign-off document linked yet. Upload a `SIGN_OFF_DOCUMENT` in documents to complete closure.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
          <input name="handoverId" type="hidden" value={handover.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-700">
              Walkthrough date
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.walkthroughDate}
                name="walkthroughDate"
                type="date"
              />
              <FieldError errors={state.fieldErrors?.walkthroughDate} />
            </label>

            <label className="block text-sm text-slate-700">
              Sign-off status
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.signOffStatus}
                name="signOffStatus"
              >
                <option value="NOT_STARTED">NOT STARTED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="SENT_TO_CLIENT">SENT TO CLIENT</option>
                <option value="PENDING_CLIENT_SIGNATURE">PENDING CLIENT SIGNATURE</option>
                <option value="SIGNED">SIGNED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <FieldError errors={state.fieldErrors?.signOffStatus} />
            </label>

            <label className="block text-sm text-slate-700">
              Signed by
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.signedBy}
                name="signedBy"
                placeholder="Client representative"
              />
            </label>

            <label className="block text-sm text-slate-700">
              Sign-off date
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.signOffDate}
                name="signOffDate"
                type="date"
              />
            </label>

            <label className="block text-sm text-slate-700 md:col-span-2">
              Checklist items
              <textarea
                className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.checklist.join("\n")}
                name="checklist"
                placeholder="One checklist item per line"
              />
            </label>

            <label className="block text-sm text-slate-700 md:col-span-2">
              Pending actions
              <textarea
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.pendingActions.join("\n")}
                name="pendingActions"
                placeholder="One pending action per line"
              />
            </label>

            <label className="block text-sm text-slate-700 md:col-span-2">
              Closure notes
              <textarea
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                defaultValue={handover.closureNotes}
                name="closureNotes"
                placeholder="Capture final rollout notes, support caveats, or closure context"
              />
            </label>
          </div>

          {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

          <button
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving handover..." : "Save handover"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Current checklist
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {handover.checklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Pending client actions
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {handover.pendingActions.length ? (
                handover.pendingActions.map((item) => <li key={item}>- {item}</li>)
              ) : (
                <li>No pending actions.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Sign-off documents
            </p>
            <div className="mt-3 space-y-3">
              {signOffDocuments.length ? (
                signOffDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl bg-slate-50/80 p-3 text-sm">
                    <p className="font-semibold text-slate-950">{document.name}</p>
                    <p className="mt-1 text-slate-600">
                      {document.version} | {document.status.replaceAll("_", " ")}
                    </p>
                    {document.storageObjectPath ? (
                      <a
                        className="mt-3 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        href={`/api/documents/${document.id}/download`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Open file
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No sign-off document uploaded yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Delivery risk
            </p>
            <p className="mt-3 text-sm text-slate-600">
              {blockedTasks > 0
                ? `${blockedTasks} blocked task${blockedTasks === 1 ? "" : "s"} still need attention before closure is fully clean.`
                : "No blocked tasks are attached to this handover right now."}
            </p>
            {handover.closureNotes ? (
              <p className="mt-3 rounded-2xl bg-slate-50/80 p-3 text-sm text-slate-600">
                {handover.closureNotes}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function HandoverWorkspace({
  clients,
  documents,
  handovers,
  tasks,
}: {
  clients: Client[];
  documents: DocumentRecord[];
  handovers: HandoverRecord[];
  tasks: Task[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          eyebrow="Final handover"
          title="Sign-off workflow"
          body="Checklist, walkthrough, pending actions, and signed closure details now live in an operational workspace instead of a static list."
        />
      </Card>

      {handovers.map((handover) => (
        <HandoverEditor
          key={handover.id}
          client={clients.find((entry) => entry.id === handover.clientId)}
          documents={documents.filter((entry) => entry.clientId === handover.clientId)}
          handover={handover}
          tasks={tasks.filter((entry) => entry.clientId === handover.clientId)}
        />
      ))}
    </div>
  );
}
