import { describe, expect, it } from "vitest";

import {
  createClientWithStages,
  createCommentRecord,
  createDocumentRecord,
  createGrantRecord,
  createImplementationPlanRecord,
  createInvoiceRecord,
  createProposalRecord,
  createTaskRecord,
  createTimeLogRecord,
  deleteTaskRecord,
  replaceDocumentVersionRecord,
  updateTaskRecord,
  updateTaskStatus,
} from "@/lib/data-access";
import { appData } from "@/lib/demo-data";
import { filterPortalDocuments, filterPortalTasks } from "@/lib/permissions";
import {
  buildClientStages,
  isValidDevelopmentStage,
  stageTemplates,
} from "@/lib/pipeline";
import { resetRuntimeStore } from "@/lib/runtime-store";

describe("pipeline rules", () => {
  it("auto-creates nine default stages", () => {
    const stages = buildClientStages("client-test", "user-admin", "2026-06-15");
    expect(stages).toHaveLength(9);
  });

  it("maps development only to the two roadmap stages", () => {
    const developmentStages = stageTemplates.filter(
      (stage) => stage.timelineGroup === "DEVELOPMENT",
    );

    expect(developmentStages).toHaveLength(2);
    expect(
      developmentStages.every((stage) => isValidDevelopmentStage(stage.name)),
    ).toBe(true);
  });
});

describe("client portal visibility", () => {
  it("exposes only client-facing documents in portal views", () => {
    const documents = filterPortalDocuments(appData.documents);
    expect(documents.every((document) => document.clientFacing)).toBe(true);
  });

  it("exposes only client-facing tasks in portal views", () => {
    const tasks = filterPortalTasks(appData.tasks);
    expect(tasks.every((task) => task.clientFacing)).toBe(true);
  });
});

describe("client creation", () => {
  it("creates a client and auto-adds nine stages in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeClients = store.clients.length;
    const beforeStages = store.stages.length;

    const client = await createClientWithStages({
      companyName: "New AIToday Client",
      uen: "202612345K",
      industry: "Services",
      projectValue: 93000,
      grantType: "EDG",
      status: "LEAD",
      accountOwnerId: "user-pm",
      startDate: "2026-06-15",
      targetHandoverDate: "2026-08-30",
      notes: "Created during automated coverage.",
    });

    expect(store.clients).toHaveLength(beforeClients + 1);
    expect(store.stages).toHaveLength(beforeStages + 9);
    expect(store.stages.filter((stage) => stage.clientId === client.id)).toHaveLength(9);
  });
});

describe("document and plan creation", () => {
  it("creates an implementation plan record in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforePlans = store.implementationPlans.length;

    const plan = await createImplementationPlanRecord({
      clientId: "client-kiu",
      relatedStageId: "client-kiu-internal-roadmap",
      name: "Kiu delivery cutover",
      version: "v3",
      status: "INTERNAL_REVIEW",
      approvalStatus: "INTERNAL_REVIEW",
      uploadedById: "user-pm",
      sourceType: "EXTERNAL_URL",
      sourceReference: "https://example.com/kiu-cutover",
      remarks: "Added from automated coverage.",
    });

    expect(store.implementationPlans).toHaveLength(beforePlans + 1);
    expect(store.implementationPlans[0]?.id).toBe(plan.id);
  });

  it("creates a document record in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeDocuments = store.documents.length;

    const document = await createDocumentRecord({
      clientId: "client-kiu",
      stageId: "client-kiu-client-facing-proposal",
      name: "Proposal attachment",
      type: "SUPPORTING_DOCUMENT",
      status: "UPLOADED",
      version: "v1",
      uploadedById: "user-pm",
      notes: "Coverage-created document.",
      clientFacing: false,
      fileName: "proposal-attachment.pdf",
      contentType: "application/pdf",
      sizeBytes: 2048,
    });

    expect(store.documents).toHaveLength(beforeDocuments + 1);
    expect(store.documents[0]?.id).toBe(document.id);
    expect(store.documents[0]?.version).toBe("v1");
  });

  it("replaces a document version in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeVersion = store.documents.find((document) => document.id === "doc-1")?.version;
    const beforeStatus = store.documents.find((document) => document.id === "doc-1")?.status;

    const document = await replaceDocumentVersionRecord({
      documentId: "doc-1",
      version: "v3",
      status: "APPROVED",
      notes: "Final signed version.",
      uploadedById: "user-pm",
      fileName: "kiu-proposal-v3.pdf",
      contentType: "application/pdf",
      sizeBytes: 4096,
      clientFacing: true,
    });

    expect(document.id).toBe("doc-1");
    expect(store.documents.find((entry) => entry.id === "doc-1")?.version).toBe("v3");
    expect(store.documents.find((entry) => entry.id === "doc-1")?.status).toBe("APPROVED");
    expect(store.documents.find((entry) => entry.id === "doc-1")?.uploadedById).toBe("user-pm");
    expect(store.documents.find((entry) => entry.id === "doc-1")?.version).not.toBe(
      beforeVersion,
    );
    expect(store.documents.find((entry) => entry.id === "doc-1")?.status).not.toBe(
      beforeStatus,
    );
  });

  it("creates implementation plan comments in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeComments = store.comments.length;

    const comment = await createCommentRecord({
      entityType: "IMPLEMENTATION_PLAN",
      entityId: "plan-kiu-v2",
      authorId: "user-pm",
      message: "Comment added from automated coverage.",
      clientFacing: false,
    });

    expect(store.comments).toHaveLength(beforeComments + 1);
    expect(store.comments[0]?.id).toBe(comment.id);
    expect(store.comments[0]?.entityType).toBe("IMPLEMENTATION_PLAN");
  });

  it("creates proposal, invoice, and grant records in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeProposals = store.proposals.length;
    const beforeInvoices = store.invoices.length;
    const beforeGrants = store.grants.length;

    const proposal = await createProposalRecord({
      clientId: "client-kiu",
      documentId: "doc-1",
      sentDate: "2026-06-16",
      approvalStatus: "SENT",
      clientComments: "Awaiting client reply.",
    });

    const invoice = await createInvoiceRecord({
      clientId: "client-kiu",
      documentId: "doc-1",
      invoiceNumber: "INV-2026-200",
      amount: 24000,
      status: "ISSUED",
      sentDate: "2026-06-16",
      remarks: "First milestone invoice.",
    });

    const grant = await createGrantRecord({
      clientId: "client-kiu",
      proposalDocumentId: "doc-1",
      invoiceDocumentId: "doc-1",
      submissionReadiness: "Commercial pack assembled.",
      submissionStatus: "IN_PROGRESS",
      approvalStatus: "INTERNAL_REVIEW",
      remarks: "Need final EDG annex.",
    });

    expect(store.proposals).toHaveLength(beforeProposals + 1);
    expect(store.invoices).toHaveLength(beforeInvoices + 1);
    expect(store.grants).toHaveLength(beforeGrants + 1);
    expect(store.proposals[0]?.id).toBe(proposal.id);
    expect(store.invoices[0]?.id).toBe(invoice.id);
    expect(store.grants[0]?.id).toBe(grant.id);
  });
});

describe("task updates", () => {
  it("creates a task and writes notification and audit entries in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeTasks = store.tasks.length;
    const beforeNotifications = store.notifications.length;
    const beforeAuditLogs = store.auditLogs.length;

    const task = await createTaskRecord({
      clientId: "client-kiu",
      stageId: "client-kiu-client-facing-roadmap",
      implementationPlanId: "plan-kiu-v2",
      title: "Prepare detailed workload delegation",
      description: "Create the next wave of delegated execution items.",
      status: "NOT_STARTED",
      priority: "HIGH",
      primaryOwnerId: "user-pm",
      supportingMemberIds: ["user-dev"],
      startDate: "2026-06-16",
      endDate: "2026-06-20",
      estimatedHours: 6,
      actualHours: 0,
      dependencyIds: ["task-1"],
      blocker: false,
      clientFacing: false,
    });

    expect(store.tasks).toHaveLength(beforeTasks + 1);
    expect(store.notifications).toHaveLength(beforeNotifications + 1);
    expect(store.auditLogs).toHaveLength(beforeAuditLogs + 1);
    expect(store.tasks[0]?.id).toBe(task.id);
    expect(store.tasks[0]?.implementationPlanId).toBe("plan-kiu-v2");
    expect(store.tasks[0]?.dependencyIds).toEqual(["task-1"]);
  });

  it("persists kanban status moves in fallback mode", async () => {
    const store = resetRuntimeStore();

    await updateTaskStatus({
      taskId: "task-1",
      status: "BLOCKED",
    });

    expect(store.tasks.find((task) => task.id === "task-1")?.status).toBe("BLOCKED");
    expect(store.tasks.find((task) => task.id === "task-1")?.blocker).toBe(true);
  });

  it("updates an existing task in fallback mode", async () => {
    const store = resetRuntimeStore();

    await updateTaskRecord({
      taskId: "task-1",
      clientId: "client-kiu",
      stageId: "client-kiu-client-facing-roadmap",
      title: "Approve final salon roadmap",
      description: "Updated through automated coverage.",
      status: "COMPLETED",
      priority: "URGENT",
      primaryOwnerId: "user-pm",
      supportingMemberIds: ["user-dev", "user-consultant"],
      startDate: "2026-06-15",
      endDate: "2026-06-18",
      estimatedHours: 10,
      actualHours: 8,
      dependencyIds: ["task-2"],
      blocker: false,
      clientFacing: true,
    });

    const task = store.tasks.find((entry) => entry.id === "task-1");
    expect(task?.title).toBe("Approve final salon roadmap");
    expect(task?.status).toBe("COMPLETED");
    expect(task?.completionPercent).toBe(100);
    expect(task?.supportingMemberIds).toEqual(["user-dev", "user-consultant"]);
    expect(task?.dependencyIds).toEqual(["task-2"]);
  });

  it("rejects self-dependencies in fallback mode", async () => {
    const store = resetRuntimeStore();

    await expect(
      updateTaskRecord({
        taskId: "task-1",
        clientId: "client-kiu",
        stageId: "client-kiu-client-facing-roadmap",
        title: "Approve final salon roadmap",
        description: "Updated through automated coverage.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        primaryOwnerId: "user-pm",
        supportingMemberIds: [],
        startDate: "2026-06-15",
        endDate: "2026-06-18",
        estimatedHours: 10,
        actualHours: 8,
        dependencyIds: ["task-1"],
        blocker: false,
        clientFacing: true,
      }),
    ).rejects.toThrow("A task cannot depend on itself.");

    expect(store.tasks.find((task) => task.id === "task-1")?.dependencyIds).not.toEqual([
      "task-1",
    ]);
  });

  it("deletes a task and its linked runtime records in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeTasks = store.tasks.length;

    await deleteTaskRecord("task-2");

    expect(store.tasks).toHaveLength(beforeTasks - 1);
    expect(store.tasks.find((task) => task.id === "task-2")).toBeUndefined();
    expect(store.timeLogs.some((log) => log.taskId === "task-2")).toBe(false);
    expect(
      store.comments.some(
        (comment) => comment.entityType === "TASK" && comment.entityId === "task-2",
      ),
    ).toBe(false);
  });
});

describe("time logging", () => {
  it("creates a time log and increments linked task actual hours in fallback mode", async () => {
    const store = resetRuntimeStore();
    const beforeTimeLogs = store.timeLogs.length;
    const beforeActualHours = store.tasks.find((task) => task.id === "task-1")?.actualHours ?? 0;

    const log = await createTimeLogRecord({
      clientId: "client-kiu",
      stageId: "client-kiu-client-facing-roadmap",
      userId: "user-pm",
      taskId: "task-1",
      hours: 2.5,
      billable: true,
      entryDate: "2026-06-16",
      description: "Extended roadmap review session.",
    });

    expect(store.timeLogs).toHaveLength(beforeTimeLogs + 1);
    expect(store.timeLogs[0]?.id).toBe(log.id);
    expect(store.tasks.find((task) => task.id === "task-1")?.actualHours).toBe(
      beforeActualHours + 2.5,
    );
  });
});
