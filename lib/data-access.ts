import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";

import type {
  AppData,
  AuditLogRecord,
  Client,
  ClientContact,
  ClientStatus,
  DocumentRecord,
  GrantRecord,
  HandoverRecord,
  ImplementationPlan,
  InvoiceRecord,
  PipelineStage,
  ProposalRecord,
  Task,
  User,
} from "@/lib/domain";
import { env } from "@/lib/env";
import { getPrismaClient } from "@/lib/prisma";
import { buildClientStages } from "@/lib/pipeline";
import { getRuntimeStore } from "@/lib/runtime-store";
import { demoStorageProvider } from "@/lib/services/storage";

export type DashboardTaskView = {
  id: string;
  title: string;
  status: Task["status"];
  priority: Task["priority"];
  blocker: boolean;
  actualHours: number;
  estimatedHours: number;
  endDate: string;
  ownerName: string;
  stageName: string;
};

export type DashboardView = {
  metrics: {
    totalClients: number;
    activeClients: number;
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    blockedTasks: number;
    overdueTasks: number;
    missingDocuments: number;
  };
  recentTasks: DashboardTaskView[];
  clients: Client[];
};

export type ClientBundle = {
  client?: Client;
  contacts: ClientContact[];
  stages: PipelineStage[];
  tasks: Task[];
  documents: DocumentRecord[];
  implementationPlans: ImplementationPlan[];
  proposals: ProposalRecord[];
  invoices: InvoiceRecord[];
  grants: GrantRecord[];
  handover?: HandoverRecord;
};

export type PlanWorkspaceView = {
  plan?: ImplementationPlan;
  client?: Client;
  tasks: Task[];
  documents: DocumentRecord[];
  comments: AppData["comments"];
};

export type ReportsView = {
  metrics: DashboardView["metrics"];
  workload: Array<{
    userId: string;
    role: User["role"];
    assignedTasks: number;
  }>;
  auditLogs: AuditLogRecord[];
};

export type CreateClientInput = {
  companyName: string;
  uen: string;
  industry: string;
  projectValue: number;
  grantType: string;
  status: ClientStatus;
  accountOwnerId: string;
  startDate: string;
  targetHandoverDate: string;
  notes: string;
};

export type CreateDocumentInput = {
  clientId: string;
  stageId?: string;
  taskId?: string;
  implementationPlanId?: string;
  name: string;
  type: DocumentRecord["type"];
  status: DocumentRecord["status"];
  version: string;
  uploadedById: string;
  notes: string;
  clientFacing: boolean;
  fileName: string;
  contentType: string;
  sizeBytes?: number;
};

export type CreateImplementationPlanInput = {
  clientId: string;
  relatedStageId: string;
  name: string;
  version: string;
  status: ImplementationPlan["status"];
  approvalStatus: ImplementationPlan["approvalStatus"];
  uploadedById: string;
  sourceType: ImplementationPlan["sourceType"];
  sourceReference: string;
  remarks: string;
};

export type UpdateTaskStatusInput = {
  taskId: string;
  status: Task["status"];
};

export type CreateTaskInput = {
  clientId: string;
  stageId: string;
  implementationPlanId?: string;
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  primaryOwnerId: string;
  supportingMemberIds: string[];
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  dependencyIds: string[];
  blocker: boolean;
  clientFacing: boolean;
};

export type CreateCommentInput = {
  entityType: "CLIENT" | "TASK" | "DOCUMENT" | "IMPLEMENTATION_PLAN";
  entityId: string;
  authorId: string;
  message: string;
  clientFacing: boolean;
};

export type CreateTimeLogInput = {
  clientId: string;
  stageId: string;
  userId: string;
  taskId?: string;
  implementationPlanTaskId?: string;
  hours: number;
  billable: boolean;
  entryDate: string;
  description: string;
};

export type UpdateTaskInput = CreateTaskInput & {
  taskId: string;
};

export type ReplaceDocumentVersionInput = {
  documentId: string;
  version: string;
  status: DocumentRecord["status"];
  notes: string;
  uploadedById: string;
  fileName: string;
  contentType: string;
  sizeBytes?: number;
  clientFacing: boolean;
};

export type CreateProposalInput = {
  clientId: string;
  documentId: string;
  sentDate: string;
  approvalStatus: ProposalRecord["approvalStatus"];
  clientComments: string;
  approvedDate?: string;
};

export type CreateInvoiceInput = {
  clientId: string;
  documentId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceRecord["status"];
  sentDate: string;
  paidDate?: string;
  remarks: string;
};

export type CreateGrantInput = {
  clientId: string;
  proposalDocumentId: string;
  invoiceDocumentId: string;
  submissionReadiness: string;
  submissionStatus: GrantRecord["submissionStatus"];
  approvalStatus: GrantRecord["approvalStatus"];
  remarks: string;
};

function hasPrismaSource() {
  return Boolean(env.databaseUrl);
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function mapPrismaClient(record: {
  id: string;
  companyName: string;
  uen: string;
  industry: string;
  projectValue: Prisma.Decimal;
  grantType: string;
  status: ClientStatus;
  accountOwnerId: string;
  startDate: Date;
  targetHandoverDate: Date;
  notes: string | null;
}): Client {
  return {
    id: record.id,
    companyName: record.companyName,
    uen: record.uen,
    industry: record.industry,
    projectValue: Number(record.projectValue),
    grantType: record.grantType,
    status: record.status,
    accountOwnerId: record.accountOwnerId,
    startDate: normalizeDate(record.startDate),
    targetHandoverDate: normalizeDate(record.targetHandoverDate),
    notes: record.notes ?? "",
  };
}

function mapPrismaStage(record: {
  id: string;
  clientId: string;
  pipelineStageId: string;
  pipelineStage: { name: string; timelineGroup: PipelineStage["timelineGroup"] };
  ownerId: string;
  status: PipelineStage["status"];
  progress: number;
  startDate: Date | null;
  dueDate: Date | null;
  blocker: boolean;
  approvalStatus: PipelineStage["approvalStatus"];
  remarks: string | null;
}): PipelineStage {
  return {
    id: record.id,
    clientId: record.clientId,
    templateKey: record.pipelineStageId,
    name: record.pipelineStage.name,
    timelineGroup: record.pipelineStage.timelineGroup,
    ownerId: record.ownerId,
    status: record.status,
    progress: record.progress,
    startDate: normalizeDate(record.startDate),
    dueDate: normalizeDate(record.dueDate),
    blocker: record.blocker,
    approvalStatus: record.approvalStatus,
    remarks: record.remarks ?? "",
  };
}

function mapPrismaTask(record: {
  id: string;
  clientId: string;
  clientPipelineStageId: string;
  implementationPlanId: string | null;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  primaryOwnerId: string;
  startDate: Date | null;
  endDate: Date | null;
  estimatedHours: Prisma.Decimal | null;
  actualHours: Prisma.Decimal | null;
  completionPercent: number;
  blocker: boolean;
  clientFacing: boolean;
  assignments: Array<{ userId: string }>;
  dependenciesTo: Array<{ predecessorId: string }>;
}): Task {
  return {
    id: record.id,
    clientId: record.clientId,
    stageId: record.clientPipelineStageId,
    implementationPlanId: record.implementationPlanId ?? undefined,
    title: record.title,
    description: record.description ?? "",
    status: record.status,
    priority: record.priority,
    primaryOwnerId: record.primaryOwnerId,
    supportingMemberIds: record.assignments.map((assignment) => assignment.userId),
    startDate: normalizeDate(record.startDate),
    endDate: normalizeDate(record.endDate),
    estimatedHours: Number(record.estimatedHours ?? 0),
    actualHours: Number(record.actualHours ?? 0),
    completionPercent: record.completionPercent,
    dependencyIds: record.dependenciesTo.map((dependency) => dependency.predecessorId),
    blocker: record.blocker,
    clientFacing: record.clientFacing,
  };
}

function mapPrismaDocument(record: {
  id: string;
  clientId: string;
  clientStageId: string | null;
  taskId: string | null;
  implementationPlanId: string | null;
  name: string;
  type: DocumentRecord["type"];
  status: DocumentRecord["status"];
  clientFacing: boolean;
  currentVersion: { versionLabel: string } | null;
  updatedAt: Date;
}): DocumentRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    stageId: record.clientStageId ?? undefined,
    taskId: record.taskId ?? undefined,
    implementationPlanId: record.implementationPlanId ?? undefined,
    name: record.name,
    type: record.type,
    status: record.status,
    version: record.currentVersion?.versionLabel ?? "v1",
    uploadedAt: normalizeDate(record.updatedAt),
    uploadedById: "user-admin",
    clientFacing: record.clientFacing,
  };
}

function mapPrismaPlan(record: {
  id: string;
  clientId: string;
  clientStageId: string;
  name: string;
  version: string;
  status: ImplementationPlan["status"];
  approvalStatus: ImplementationPlan["approvalStatus"];
  uploadedById: string;
  uploadDate: Date;
  sourceType: string;
  sourceReference: string;
  remarks: string | null;
}): ImplementationPlan {
  return {
    id: record.id,
    clientId: record.clientId,
    relatedStageId: record.clientStageId,
    name: record.name,
    version: record.version,
    status: record.status,
    approvalStatus: record.approvalStatus,
    uploadedById: record.uploadedById,
    uploadDate: normalizeDate(record.uploadDate),
    sourceType: record.sourceType as ImplementationPlan["sourceType"],
    sourceReference: record.sourceReference,
    remarks: record.remarks ?? "",
  };
}

function mapPrismaContact(record: {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  portalAccess: boolean;
}): ClientContact {
  return {
    id: record.id,
    clientId: record.clientId,
    name: record.name,
    email: record.email,
    phone: record.phone ?? "",
    role: record.role,
    portalAccess: record.portalAccess,
  };
}

function mapPrismaHandover(record: {
  id: string;
  clientId: string;
  signOffStatus: HandoverRecord["signOffStatus"];
  walkthroughDate: Date | null;
  signedBy: string | null;
  signOffDate: Date | null;
  pendingActions: Prisma.JsonValue | null;
}): HandoverRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    signOffStatus: record.signOffStatus,
    walkthroughDate: normalizeDate(record.walkthroughDate),
    signedBy: record.signedBy ?? undefined,
    signOffDate: normalizeDate(record.signOffDate) || undefined,
    pendingActions: Array.isArray(record.pendingActions)
      ? record.pendingActions.map(String)
      : [],
  };
}

function mapPrismaProposal(record: {
  id: string;
  clientId: string;
  documentId: string;
  sentDate: Date | null;
  approvalStatus: ProposalRecord["approvalStatus"];
  clientComments: string | null;
  approvedDate: Date | null;
}): ProposalRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    documentId: record.documentId,
    sentDate: normalizeDate(record.sentDate),
    approvalStatus: record.approvalStatus,
    clientComments: record.clientComments ?? "",
    approvedDate: normalizeDate(record.approvedDate) || undefined,
  };
}

function mapPrismaInvoice(record: {
  id: string;
  clientId: string;
  documentId: string;
  invoiceNumber: string;
  amount: Prisma.Decimal;
  status: InvoiceRecord["status"];
  sentDate: Date | null;
  paidDate: Date | null;
  remarks: string | null;
}): InvoiceRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    documentId: record.documentId,
    invoiceNumber: record.invoiceNumber,
    amount: Number(record.amount),
    status: record.status,
    sentDate: normalizeDate(record.sentDate),
    paidDate: normalizeDate(record.paidDate) || undefined,
    remarks: record.remarks ?? "",
  };
}

function mapPrismaGrant(record: {
  id: string;
  clientId: string;
  proposalDocumentId: string;
  invoiceDocumentId: string;
  submissionReadiness: string | null;
  submissionStatus: GrantRecord["submissionStatus"];
  approvalStatus: GrantRecord["approvalStatus"];
  remarks: string | null;
}): GrantRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    proposalDocumentId: record.proposalDocumentId,
    invoiceDocumentId: record.invoiceDocumentId,
    submissionReadiness: record.submissionReadiness ?? "",
    submissionStatus: record.submissionStatus,
    approvalStatus: record.approvalStatus,
    remarks: record.remarks ?? "",
  };
}

function buildDashboardView(data: AppData): DashboardView {
  const totalHours = data.timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const billableHours = data.timeLogs
    .filter((log) => log.billable)
    .reduce((sum, log) => sum + log.hours, 0);
  const blockedTasks = data.tasks.filter((task) => task.blocker).length;
  const overdueTasks = data.tasks.filter(
    (task) =>
      task.status !== "COMPLETED" &&
      Boolean(task.endDate) &&
      new Date(task.endDate) < new Date("2026-06-15"),
  ).length;
  const missingDocuments = data.stages.filter(
    (stage) => !data.documents.some((document) => document.stageId === stage.id),
  ).length;

  return {
    metrics: {
      totalClients: data.clients.length,
      activeClients: data.clients.filter((client) => client.status !== "ARCHIVED").length,
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      blockedTasks,
      overdueTasks,
      missingDocuments,
    },
    recentTasks: data.tasks.slice(0, 4).map((task) => {
      const owner = data.users.find((user) => user.id === task.primaryOwnerId);
      const stage = data.stages.find((entry) => entry.id === task.stageId);

      return {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        blocker: task.blocker,
        actualHours: task.actualHours,
        estimatedHours: task.estimatedHours,
        endDate: task.endDate,
        ownerName: owner?.name ?? "Unassigned",
        stageName: stage?.name ?? "Unmapped stage",
      };
    }),
    clients: data.clients,
  };
}

function buildClientBundle(data: AppData, clientId: string): ClientBundle {
  return {
    client: data.clients.find((entry) => entry.id === clientId),
    contacts: data.contacts.filter((entry) => entry.clientId === clientId),
    stages: data.stages.filter((entry) => entry.clientId === clientId),
    tasks: data.tasks.filter((entry) => entry.clientId === clientId),
    documents: data.documents.filter((entry) => entry.clientId === clientId),
    implementationPlans: data.implementationPlans.filter(
      (entry) => entry.clientId === clientId,
    ),
    proposals: data.proposals.filter((entry) => entry.clientId === clientId),
    invoices: data.invoices.filter((entry) => entry.clientId === clientId),
    grants: data.grants.filter((entry) => entry.clientId === clientId),
    handover: data.handovers.find((entry) => entry.clientId === clientId),
  };
}

function normalizeToday() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeTimestamp() {
  return new Date().toISOString();
}

function assertStageBelongsToClient(data: AppData, clientId: string, stageId: string) {
  const stage = data.stages.find((entry) => entry.id === stageId);

  if (!stage || stage.clientId !== clientId) {
    throw new Error("Selected stage does not belong to the chosen client.");
  }
}

function assertTaskBelongsToClient(data: AppData, clientId: string, taskId: string) {
  const task = data.tasks.find((entry) => entry.id === taskId);

  if (!task || task.clientId !== clientId) {
    throw new Error("Selected task does not belong to the chosen client.");
  }

  return task;
}

function assertDependencyTasksBelongToClient(
  data: AppData,
  clientId: string,
  taskId: string | undefined,
  dependencyIds: string[],
) {
  for (const dependencyId of dependencyIds) {
    if (taskId && dependencyId === taskId) {
      throw new Error("A task cannot depend on itself.");
    }

    assertTaskBelongsToClient(data, clientId, dependencyId);
  }
}

function getFallbackData() {
  return getRuntimeStore();
}

async function tryPrismaClients() {
  const prisma = getPrismaClient();
  const records = await prisma.client.findMany({
    orderBy: {
      startDate: "desc",
    },
  });

  return records.map(mapPrismaClient);
}

async function tryPrismaUsers() {
  const prisma = getPrismaClient();
  const records = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    avatar: record.avatar ?? record.name.slice(0, 2).toUpperCase(),
    capacityHours: record.capacityHours,
  }));
}

async function tryPrismaStages() {
  const prisma = getPrismaClient();
  const records = await prisma.clientPipelineStage.findMany({
    include: {
      pipelineStage: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return records.map(mapPrismaStage);
}

async function tryPrismaDocuments() {
  const prisma = getPrismaClient();
  const records = await prisma.document.findMany({
    include: {
      currentVersion: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return records.map(mapPrismaDocument);
}

async function tryPrismaNotifications() {
  const prisma = getPrismaClient();
  const records = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((record) => ({
    id: record.id,
    userId: record.userId,
    title: record.title,
    body: record.body,
    createdAt: normalizeDate(record.createdAt),
    read: record.read,
  }));
}

async function tryPrismaTimeLogs() {
  const prisma = getPrismaClient();
  const records = await prisma.timeLog.findMany({
    orderBy: {
      entryDate: "desc",
    },
  });

  return records.map((log) => ({
    id: log.id,
    clientId: log.clientId,
    taskId: log.taskId ?? undefined,
    implementationPlanTaskId: log.implementationPlanTaskId ?? undefined,
    userId: log.userId,
    stageId: log.clientStageId,
    hours: Number(log.hours),
    billable: log.billable,
    entryDate: normalizeDate(log.entryDate),
    description: log.description,
  }));
}

async function tryPrismaAuditLogs() {
  const prisma = getPrismaClient();
  const records = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return records.map((record) => ({
    id: record.id,
    actorId: record.actorId,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId,
    createdAt: normalizeDate(record.createdAt),
  }));
}

async function tryPrismaClientBundle(clientId: string): Promise<ClientBundle> {
  const prisma = getPrismaClient();
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      contacts: true,
      pipelineStages: {
        include: {
          pipelineStage: true,
        },
        orderBy: {
          pipelineStage: {
            order: "asc",
          },
        },
      },
      tasks: {
        include: {
          assignments: true,
          dependenciesTo: true,
        },
      },
      documents: {
        include: {
          currentVersion: true,
        },
      },
      implementationPlans: true,
      proposals: true,
      invoices: true,
      grants: true,
      handoverRecord: true,
    },
  });

  if (!client) {
    return {
      contacts: [],
      stages: [],
      tasks: [],
      documents: [],
      implementationPlans: [],
      proposals: [],
      invoices: [],
      grants: [],
    };
  }

  return {
    client: mapPrismaClient(client),
    contacts: client.contacts.map(mapPrismaContact),
    stages: client.pipelineStages.map(mapPrismaStage),
    tasks: client.tasks.map(mapPrismaTask),
    documents: client.documents.map(mapPrismaDocument),
    implementationPlans: client.implementationPlans.map(mapPrismaPlan),
    proposals: client.proposals.map(mapPrismaProposal),
    invoices: client.invoices.map(mapPrismaInvoice),
    grants: client.grants.map(mapPrismaGrant),
    handover: client.handoverRecord ? mapPrismaHandover(client.handoverRecord) : undefined,
  };
}

export async function listUsers() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().users].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  try {
    return await tryPrismaUsers();
  } catch {
    return [...getFallbackData().users].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }
}

export async function listClients() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().clients].sort((left, right) =>
      right.startDate.localeCompare(left.startDate),
    );
  }

  try {
    return await tryPrismaClients();
  } catch {
    return [...getFallbackData().clients].sort((left, right) =>
      right.startDate.localeCompare(left.startDate),
    );
  }
}

export async function listTasks() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().tasks];
  }

  try {
    const prisma = getPrismaClient();
    const tasks = await prisma.task.findMany({
      include: {
        assignments: true,
        dependenciesTo: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return tasks.map(mapPrismaTask);
  } catch {
    return [...getFallbackData().tasks];
  }
}

export async function listStages() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().stages];
  }

  try {
    return await tryPrismaStages();
  } catch {
    return [...getFallbackData().stages];
  }
}

export async function listImplementationPlans() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().implementationPlans];
  }

  try {
    const prisma = getPrismaClient();
    const plans = await prisma.implementationPlan.findMany({
      orderBy: {
        uploadDate: "desc",
      },
    });

    return plans.map(mapPrismaPlan);
  } catch {
    return [...getFallbackData().implementationPlans];
  }
}

export async function listDocuments() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().documents];
  }

  try {
    return await tryPrismaDocuments();
  } catch {
    return [...getFallbackData().documents];
  }
}

export async function listNotifications() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().notifications];
  }

  try {
    return await tryPrismaNotifications();
  } catch {
    return [...getFallbackData().notifications];
  }
}

export async function listTimeLogs() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().timeLogs];
  }

  try {
    return await tryPrismaTimeLogs();
  } catch {
    return [...getFallbackData().timeLogs];
  }
}

export async function listAuditLogs() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().auditLogs];
  }

  try {
    return await tryPrismaAuditLogs();
  } catch {
    return [...getFallbackData().auditLogs];
  }
}

export async function listHandovers() {
  if (!hasPrismaSource()) {
    return [...getFallbackData().handovers];
  }

  try {
    const prisma = getPrismaClient();
    const records = await prisma.handoverRecord.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return records.map(mapPrismaHandover);
  } catch {
    return [...getFallbackData().handovers];
  }
}

export async function getDashboardView() {
  if (!hasPrismaSource()) {
    return buildDashboardView(getFallbackData());
  }

  try {
    const prisma = getPrismaClient();
    const [users, clients, stages, tasks, documents, implementationPlans, timeLogs] =
      await Promise.all([
        tryPrismaUsers(),
        tryPrismaClients(),
        prisma.clientPipelineStage.findMany({
          include: { pipelineStage: true },
        }),
        prisma.task.findMany({
          include: {
            assignments: true,
            dependenciesTo: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.document.findMany({
          include: { currentVersion: true },
        }),
        prisma.implementationPlan.findMany(),
        prisma.timeLog.findMany(),
      ]);

    return buildDashboardView({
      users,
      clients,
      contacts: [],
      stages: stages.map(mapPrismaStage),
      tasks: tasks.map(mapPrismaTask),
      documents: documents.map(mapPrismaDocument),
      implementationPlans: implementationPlans.map(mapPrismaPlan),
      timeLogs: timeLogs.map((log) => ({
        id: log.id,
        clientId: log.clientId,
        taskId: log.taskId ?? undefined,
        implementationPlanTaskId: log.implementationPlanTaskId ?? undefined,
        userId: log.userId,
        stageId: log.clientStageId,
        hours: Number(log.hours),
        billable: log.billable,
        entryDate: normalizeDate(log.entryDate),
        description: log.description,
      })),
      notifications: [],
      proposals: [],
      invoices: [],
      grants: [],
      handovers: [],
      comments: [],
      auditLogs: [],
      portalAccess: [],
    });
  } catch {
    return buildDashboardView(getFallbackData());
  }
}

export async function getClientBundleById(clientId: string) {
  if (!hasPrismaSource()) {
    return buildClientBundle(getFallbackData(), clientId);
  }

  try {
    return await tryPrismaClientBundle(clientId);
  } catch {
    return buildClientBundle(getFallbackData(), clientId);
  }
}

export async function getPlanWorkspaceById(planId: string): Promise<PlanWorkspaceView> {
  if (!hasPrismaSource()) {
    const data = getFallbackData();
    const plan = data.implementationPlans.find((entry) => entry.id === planId);

    return {
      plan,
      client: plan ? data.clients.find((entry) => entry.id === plan.clientId) : undefined,
      tasks: data.tasks.filter((task) => task.implementationPlanId === planId),
      documents: data.documents.filter((document) => document.implementationPlanId === planId),
      comments: data.comments.filter(
        (comment) =>
          comment.entityType === "IMPLEMENTATION_PLAN" && comment.entityId === planId,
      ),
    };
  }

  try {
    const prisma = getPrismaClient();
    const plan = await prisma.implementationPlan.findUnique({
      where: { id: planId },
      include: {
        client: true,
        tasks: {
          include: {
            assignments: true,
            dependenciesTo: true,
          },
        },
        documents: {
          include: {
            currentVersion: true,
          },
        },
      },
    });

    if (!plan) {
      return {
        tasks: [],
        documents: [],
        comments: [],
      };
    }

    return {
      plan: mapPrismaPlan(plan),
      client: mapPrismaClient(plan.client),
      tasks: plan.tasks.map(mapPrismaTask),
      documents: plan.documents.map(mapPrismaDocument),
      comments: [],
    };
  } catch {
    const data = getFallbackData();
    const plan = data.implementationPlans.find((entry) => entry.id === planId);

    return {
      plan,
      client: plan ? data.clients.find((entry) => entry.id === plan.clientId) : undefined,
      tasks: data.tasks.filter((task) => task.implementationPlanId === planId),
      documents: data.documents.filter((document) => document.implementationPlanId === planId),
      comments: data.comments.filter(
        (comment) =>
          comment.entityType === "IMPLEMENTATION_PLAN" && comment.entityId === planId,
      ),
    };
  }
}

export async function getReportsView(): Promise<ReportsView> {
  const [dashboard, users, tasks, auditLogs] = await Promise.all([
    getDashboardView(),
    listUsers(),
    listTasks(),
    listAuditLogs(),
  ]);

  return {
    metrics: dashboard.metrics,
    workload: users.map((user) => ({
      userId: user.id,
      role: user.role,
      assignedTasks: tasks.filter((task) => task.primaryOwnerId === user.id).length,
    })),
    auditLogs,
  };
}

export async function createClientWithStages(input: CreateClientInput) {
  const clientId = `client-${randomUUID()}`;
  const stages = buildClientStages(clientId, input.accountOwnerId, input.startDate);
  const client: Client = {
    id: clientId,
    companyName: input.companyName,
    uen: input.uen,
    industry: input.industry,
    projectValue: input.projectValue,
    grantType: input.grantType,
    status: input.status,
    accountOwnerId: input.accountOwnerId,
    startDate: input.startDate,
    targetHandoverDate: input.targetHandoverDate,
    notes: input.notes,
  };

  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      await prisma.$transaction([
        prisma.client.create({
          data: {
            id: client.id,
            companyName: client.companyName,
            uen: client.uen,
            industry: client.industry,
            projectValue: client.projectValue,
            grantType: client.grantType,
            status: client.status,
            accountOwnerId: client.accountOwnerId,
            startDate: new Date(client.startDate),
            targetHandoverDate: new Date(client.targetHandoverDate),
            notes: client.notes,
          },
        }),
        prisma.clientPipelineStage.createMany({
          data: stages.map((stage) => ({
            id: stage.id,
            clientId: stage.clientId,
            pipelineStageId: stage.templateKey,
            ownerId: stage.ownerId,
            status: stage.status,
            startDate: stage.startDate ? new Date(stage.startDate) : null,
            dueDate: stage.dueDate ? new Date(stage.dueDate) : null,
            progress: stage.progress,
            blocker: stage.blocker,
            approvalStatus: stage.approvalStatus,
            remarks: stage.remarks,
          })),
        }),
      ]);

      return client;
    } catch {
      // Fall back to the in-memory store when database credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  store.clients.unshift(client);
  store.stages.unshift(...stages);

  return client;
}

export async function createDocumentRecord(input: CreateDocumentInput) {
  const upload = await demoStorageProvider.upload({
    path: `clients/${input.clientId}/documents`,
    fileName: input.fileName,
    contentType: input.contentType,
  });

  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const stage = await prisma.clientPipelineStage.findUnique({
        where: { id: input.stageId ?? "" },
      });

      if (input.stageId && (!stage || stage.clientId !== input.clientId)) {
        throw new Error("Selected stage does not belong to the chosen client.");
      }

      const documentId = `document-${randomUUID()}`;
      const versionId = `document-version-${randomUUID()}`;

      await prisma.$transaction(async (tx) => {
        await tx.document.create({
          data: {
            id: documentId,
            clientId: input.clientId,
            clientStageId: input.stageId,
            taskId: input.taskId,
            implementationPlanId: input.implementationPlanId,
            name: input.name,
            type: input.type,
            status: input.status,
            clientFacing: input.clientFacing,
          },
        });

        await tx.documentVersion.create({
          data: {
            id: versionId,
            documentId,
            versionLabel: input.version,
            storagePath: upload.publicUrl,
            mimeType: input.contentType,
            sizeBytes: input.sizeBytes,
            status: input.status,
            uploadedById: input.uploadedById,
            notes: input.notes,
          },
        });

        await tx.document.update({
          where: { id: documentId },
          data: {
            currentVersionId: versionId,
          },
        });
      });

      return {
        id: documentId,
        clientId: input.clientId,
        stageId: input.stageId,
        taskId: input.taskId,
        implementationPlanId: input.implementationPlanId,
        name: input.name,
        type: input.type,
        status: input.status,
        version: input.version,
        uploadedAt: normalizeToday(),
        uploadedById: input.uploadedById,
        clientFacing: input.clientFacing,
      } satisfies DocumentRecord;
    } catch {
      // Fall back to runtime storage when Prisma credentials or relations are unavailable.
    }
  }

  const store = getFallbackData();

  if (input.stageId) {
    assertStageBelongsToClient(store, input.clientId, input.stageId);
  }

  const document: DocumentRecord = {
    id: `document-${randomUUID()}`,
    clientId: input.clientId,
    stageId: input.stageId,
    taskId: input.taskId,
    implementationPlanId: input.implementationPlanId,
    name: input.name,
    type: input.type,
    status: input.status,
    version: input.version,
    uploadedAt: normalizeToday(),
    uploadedById: input.uploadedById,
    clientFacing: input.clientFacing,
  };

  store.documents.unshift(document);
  return document;
}

export async function createImplementationPlanRecord(input: CreateImplementationPlanInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const planId = `plan-${randomUUID()}`;
      const stage = await prisma.clientPipelineStage.findUnique({
        where: { id: input.relatedStageId },
      });

      if (!stage || stage.clientId !== input.clientId) {
        throw new Error("Selected stage does not belong to the chosen client.");
      }

      await prisma.implementationPlan.create({
        data: {
          id: planId,
          clientId: input.clientId,
          clientStageId: input.relatedStageId,
          name: input.name,
          version: input.version,
          status: input.status,
          approvalStatus: input.approvalStatus,
          uploadedById: input.uploadedById,
          uploadDate: new Date(),
          sourceType: input.sourceType,
          sourceReference: input.sourceReference,
          remarks: input.remarks,
        },
      });

      return {
        id: planId,
        clientId: input.clientId,
        relatedStageId: input.relatedStageId,
        name: input.name,
        version: input.version,
        status: input.status,
        approvalStatus: input.approvalStatus,
        uploadedById: input.uploadedById,
        uploadDate: normalizeToday(),
        sourceType: input.sourceType,
        sourceReference: input.sourceReference,
        remarks: input.remarks,
      } satisfies ImplementationPlan;
    } catch {
      // Fall back to runtime storage when Prisma credentials or relations are unavailable.
    }
  }

  const store = getFallbackData();
  assertStageBelongsToClient(store, input.clientId, input.relatedStageId);

  const plan: ImplementationPlan = {
    id: `plan-${randomUUID()}`,
    clientId: input.clientId,
    relatedStageId: input.relatedStageId,
    name: input.name,
    version: input.version,
    status: input.status,
    approvalStatus: input.approvalStatus,
    uploadedById: input.uploadedById,
    uploadDate: normalizeToday(),
    sourceType: input.sourceType,
    sourceReference: input.sourceReference,
    remarks: input.remarks,
  };

  store.implementationPlans.unshift(plan);
  return plan;
}

export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const task = await prisma.task.update({
        where: { id: input.taskId },
        data: {
          status: input.status,
          completionPercent: input.status === "COMPLETED" ? 100 : undefined,
          blocker: input.status === "BLOCKED",
        },
        include: {
          assignments: true,
          dependenciesTo: true,
        },
      });

      return mapPrismaTask(task);
    } catch {
      // Fall back to runtime storage when Prisma is unavailable.
    }
  }

  const store = getFallbackData();
  const task = store.tasks.find((entry) => entry.id === input.taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  task.status = input.status;
  task.blocker = input.status === "BLOCKED";
  task.completionPercent = input.status === "COMPLETED" ? 100 : task.completionPercent;

  return task;
}

export async function createTaskRecord(input: CreateTaskInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const stage = await prisma.clientPipelineStage.findUnique({
        where: { id: input.stageId },
      });

      if (!stage || stage.clientId !== input.clientId) {
        throw new Error("Selected stage does not belong to the chosen client.");
      }

      const taskId = `task-${randomUUID()}`;
      const task = await prisma.task.create({
        data: {
          id: taskId,
          clientId: input.clientId,
          clientPipelineStageId: input.stageId,
          implementationPlanId: input.implementationPlanId,
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          primaryOwnerId: input.primaryOwnerId,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          estimatedHours: input.estimatedHours,
          actualHours: input.actualHours,
          completionPercent: input.status === "COMPLETED" ? 100 : 0,
          blocker: input.blocker || input.status === "BLOCKED",
          clientFacing: input.clientFacing,
          assignments: input.supportingMemberIds.length
            ? {
                create: input.supportingMemberIds.map((userId) => ({
                  userId,
                  roleLabel: "SUPPORTING_MEMBER",
                })),
              }
            : undefined,
          dependenciesTo: input.dependencyIds.length
            ? {
                create: input.dependencyIds.map((dependencyId) => ({
                  predecessorId: dependencyId,
                })),
              }
            : undefined,
        },
        include: {
          assignments: true,
          dependenciesTo: true,
        },
      });

      return mapPrismaTask(task);
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  assertStageBelongsToClient(store, input.clientId, input.stageId);
  assertDependencyTasksBelongToClient(store, input.clientId, undefined, input.dependencyIds);

  const task: Task = {
    id: `task-${randomUUID()}`,
    clientId: input.clientId,
    stageId: input.stageId,
    implementationPlanId: input.implementationPlanId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    primaryOwnerId: input.primaryOwnerId,
    supportingMemberIds: input.supportingMemberIds,
    startDate: input.startDate,
    endDate: input.endDate,
    estimatedHours: input.estimatedHours,
    actualHours: input.actualHours,
    completionPercent: input.status === "COMPLETED" ? 100 : 0,
    dependencyIds: input.dependencyIds,
    blocker: input.blocker || input.status === "BLOCKED",
    clientFacing: input.clientFacing,
  };

  store.tasks.unshift(task);
  store.notifications.unshift({
    id: `notif-${randomUUID()}`,
    userId: input.primaryOwnerId,
    title: "New task assigned",
    body: input.title,
    createdAt: normalizeTimestamp(),
    read: false,
  });
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: input.primaryOwnerId,
    action: "TASK_CREATED",
    entityType: "TASK",
    entityId: task.id,
    createdAt: normalizeTimestamp(),
  });

  return task;
}

export async function createCommentRecord(input: CreateCommentInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const comment = await prisma.comment.create({
        data: {
          id: `comment-${randomUUID()}`,
          entityType: input.entityType,
          entityId: input.entityId,
          authorId: input.authorId,
          message: input.message,
          clientFacing: input.clientFacing,
        },
      });

      return {
        id: comment.id,
        entityType: comment.entityType as CreateCommentInput["entityType"],
        entityId: comment.entityId,
        authorId: comment.authorId,
        message: comment.message,
        clientFacing: comment.clientFacing,
        createdAt: comment.createdAt.toISOString(),
      };
    } catch {
      // Fall back to runtime storage when Prisma is unavailable.
    }
  }

  const store = getFallbackData();
  const comment = {
    id: `comment-${randomUUID()}`,
    entityType: input.entityType,
    entityId: input.entityId,
    authorId: input.authorId,
    message: input.message,
    clientFacing: input.clientFacing,
    createdAt: normalizeTimestamp(),
  } satisfies AppData["comments"][number];

  store.comments.unshift(comment);
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: input.authorId,
    action: "COMMENT_CREATED",
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt: normalizeTimestamp(),
  });

  return comment;
}

export async function createTimeLogRecord(input: CreateTimeLogInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const stage = await prisma.clientPipelineStage.findUnique({
        where: { id: input.stageId },
      });

      if (!stage || stage.clientId !== input.clientId) {
        throw new Error("Selected stage does not belong to the chosen client.");
      }

      if (input.taskId) {
        const task = await prisma.task.findUnique({
          where: { id: input.taskId },
        });

        if (!task || task.clientId !== input.clientId) {
          throw new Error("Selected task does not belong to the chosen client.");
        }
      }

      const logId = `time-${randomUUID()}`;
      await prisma.$transaction(async (tx) => {
        await tx.timeLog.create({
          data: {
            id: logId,
            clientId: input.clientId,
            userId: input.userId,
            clientStageId: input.stageId,
            taskId: input.taskId,
            implementationPlanTaskId: input.implementationPlanTaskId,
            hours: input.hours,
            billable: input.billable,
            entryDate: new Date(input.entryDate),
            description: input.description,
          },
        });

        if (input.taskId) {
          const task = await tx.task.findUnique({
            where: { id: input.taskId },
            select: { actualHours: true },
          });

          await tx.task.update({
            where: { id: input.taskId },
            data: {
              actualHours: Number(task?.actualHours ?? 0) + input.hours,
            },
          });
        }
      });

      return {
        id: logId,
        clientId: input.clientId,
        taskId: input.taskId,
        implementationPlanTaskId: input.implementationPlanTaskId,
        userId: input.userId,
        stageId: input.stageId,
        hours: input.hours,
        billable: input.billable,
        entryDate: input.entryDate,
        description: input.description,
      };
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  assertStageBelongsToClient(store, input.clientId, input.stageId);

  if (input.taskId) {
    const task = assertTaskBelongsToClient(store, input.clientId, input.taskId);
    task.actualHours += input.hours;
  }

  const timeLog = {
    id: `time-${randomUUID()}`,
    clientId: input.clientId,
    taskId: input.taskId,
    implementationPlanTaskId: input.implementationPlanTaskId,
    userId: input.userId,
    stageId: input.stageId,
    hours: input.hours,
    billable: input.billable,
    entryDate: input.entryDate,
    description: input.description,
  };

  store.timeLogs.unshift(timeLog);
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: input.userId,
    action: "TIME_LOG_CREATED",
    entityType: "TIME_LOG",
    entityId: timeLog.id,
    createdAt: normalizeTimestamp(),
  });

  return timeLog;
}

export async function updateTaskRecord(input: UpdateTaskInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const stage = await prisma.clientPipelineStage.findUnique({
        where: { id: input.stageId },
      });

      if (!stage || stage.clientId !== input.clientId) {
        throw new Error("Selected stage does not belong to the chosen client.");
      }

      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
        include: {
          assignments: true,
          dependenciesTo: true,
        },
      });

      if (!task) {
        throw new Error("Task not found.");
      }

        const updatedTask = await prisma.$transaction(async (tx) => {
          await tx.taskAssignment.deleteMany({
            where: { taskId: input.taskId },
          });
          await tx.taskDependency.deleteMany({
            where: { successorId: input.taskId },
          });

          return tx.task.update({
            where: { id: input.taskId },
          data: {
            clientId: input.clientId,
            clientPipelineStageId: input.stageId,
            implementationPlanId: input.implementationPlanId,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            primaryOwnerId: input.primaryOwnerId,
            startDate: input.startDate ? new Date(input.startDate) : null,
            endDate: input.endDate ? new Date(input.endDate) : null,
            estimatedHours: input.estimatedHours,
            actualHours: input.actualHours,
            completionPercent: input.status === "COMPLETED" ? 100 : task.completionPercent,
            blocker: input.blocker || input.status === "BLOCKED",
            clientFacing: input.clientFacing,
              assignments: input.supportingMemberIds.length
                ? {
                    create: input.supportingMemberIds.map((userId) => ({
                      userId,
                      roleLabel: "SUPPORTING_MEMBER",
                    })),
                  }
                : undefined,
              dependenciesTo: input.dependencyIds.length
                ? {
                    create: input.dependencyIds.map((dependencyId) => ({
                      predecessorId: dependencyId,
                    })),
                  }
                : undefined,
            },
          include: {
            assignments: true,
            dependenciesTo: true,
          },
        });
      });

      return mapPrismaTask(updatedTask);
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  assertStageBelongsToClient(store, input.clientId, input.stageId);
  assertDependencyTasksBelongToClient(store, input.clientId, input.taskId, input.dependencyIds);
  const task = store.tasks.find((entry) => entry.id === input.taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  task.clientId = input.clientId;
  task.stageId = input.stageId;
  task.implementationPlanId = input.implementationPlanId;
  task.title = input.title;
  task.description = input.description;
  task.status = input.status;
  task.priority = input.priority;
  task.primaryOwnerId = input.primaryOwnerId;
  task.supportingMemberIds = input.supportingMemberIds;
  task.startDate = input.startDate;
  task.endDate = input.endDate;
  task.estimatedHours = input.estimatedHours;
  task.actualHours = input.actualHours;
  task.dependencyIds = input.dependencyIds;
  task.blocker = input.blocker || input.status === "BLOCKED";
  task.clientFacing = input.clientFacing;
  task.completionPercent = input.status === "COMPLETED" ? 100 : task.completionPercent;

  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: input.primaryOwnerId,
    action: "TASK_UPDATED",
    entityType: "TASK",
    entityId: task.id,
    createdAt: normalizeTimestamp(),
  });

  return task;
}

export async function deleteTaskRecord(taskId: string) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      await prisma.task.delete({
        where: { id: taskId },
      });
      return;
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  const taskIndex = store.tasks.findIndex((entry) => entry.id === taskId);

  if (taskIndex === -1) {
    throw new Error("Task not found.");
  }

  const [task] = store.tasks.splice(taskIndex, 1);
  store.timeLogs = store.timeLogs.filter((log) => log.taskId !== taskId);
  store.comments = store.comments.filter(
    (comment) => !(comment.entityType === "TASK" && comment.entityId === taskId),
  );
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: task.primaryOwnerId,
    action: "TASK_DELETED",
    entityType: "TASK",
    entityId: task.id,
    createdAt: normalizeTimestamp(),
  });
}

export async function replaceDocumentVersionRecord(input: ReplaceDocumentVersionInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const document = await prisma.document.findUnique({
        where: { id: input.documentId },
      });

      if (!document) {
        throw new Error("Document not found.");
      }

      const upload = await demoStorageProvider.upload({
        path: `clients/${document.clientId}/documents/${document.id}`,
        fileName: input.fileName,
        contentType: input.contentType,
      });

      const versionId = `document-version-${randomUUID()}`;
      await prisma.$transaction(async (tx) => {
        await tx.documentVersion.create({
          data: {
            id: versionId,
            documentId: document.id,
            versionLabel: input.version,
            storagePath: upload.publicUrl,
            mimeType: input.contentType,
            sizeBytes: input.sizeBytes,
            status: input.status,
            uploadedById: input.uploadedById,
            notes: input.notes,
          },
        });

        await tx.document.update({
          where: { id: document.id },
          data: {
            currentVersionId: versionId,
            status: input.status,
            clientFacing: input.clientFacing,
          },
        });
      });

      return {
        id: document.id,
        clientId: document.clientId,
        stageId: document.clientStageId ?? undefined,
        taskId: document.taskId ?? undefined,
        implementationPlanId: document.implementationPlanId ?? undefined,
        name: document.name,
        type: document.type,
        status: input.status,
        version: input.version,
        uploadedAt: normalizeToday(),
        uploadedById: input.uploadedById,
        clientFacing: input.clientFacing,
      } satisfies DocumentRecord;
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  const document = store.documents.find((entry) => entry.id === input.documentId);

  if (!document) {
    throw new Error("Document not found.");
  }

  document.version = input.version;
  document.status = input.status;
  document.uploadedAt = normalizeToday();
  document.uploadedById = input.uploadedById;
  document.clientFacing = input.clientFacing;

  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: input.uploadedById,
    action: "DOCUMENT_VERSION_REPLACED",
    entityType: "DOCUMENT",
    entityId: document.id,
    createdAt: normalizeTimestamp(),
  });

  return document;
}

export async function createProposalRecord(input: CreateProposalInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const proposal = await prisma.proposalRecord.create({
        data: {
          id: `proposal-${randomUUID()}`,
          clientId: input.clientId,
          documentId: input.documentId,
          sentDate: input.sentDate ? new Date(input.sentDate) : null,
          approvalStatus: input.approvalStatus,
          clientComments: input.clientComments,
          approvedDate: input.approvedDate ? new Date(input.approvedDate) : null,
        },
      });

      return mapPrismaProposal(proposal);
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  const proposal: ProposalRecord = {
    id: `proposal-${randomUUID()}`,
    clientId: input.clientId,
    documentId: input.documentId,
    sentDate: input.sentDate,
    approvalStatus: input.approvalStatus,
    clientComments: input.clientComments,
    approvedDate: input.approvedDate || undefined,
  };

  store.proposals.unshift(proposal);
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: "user-pm",
    action: "PROPOSAL_CREATED",
    entityType: "PROPOSAL",
    entityId: proposal.id,
    createdAt: normalizeTimestamp(),
  });

  return proposal;
}

export async function createInvoiceRecord(input: CreateInvoiceInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const invoice = await prisma.invoiceRecord.create({
        data: {
          id: `invoice-${randomUUID()}`,
          clientId: input.clientId,
          documentId: input.documentId,
          invoiceNumber: input.invoiceNumber,
          amount: input.amount,
          status: input.status,
          sentDate: input.sentDate ? new Date(input.sentDate) : null,
          paidDate: input.paidDate ? new Date(input.paidDate) : null,
          remarks: input.remarks,
        },
      });

      return mapPrismaInvoice(invoice);
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  const invoice: InvoiceRecord = {
    id: `invoice-${randomUUID()}`,
    clientId: input.clientId,
    documentId: input.documentId,
    invoiceNumber: input.invoiceNumber,
    amount: input.amount,
    status: input.status,
    sentDate: input.sentDate,
    paidDate: input.paidDate || undefined,
    remarks: input.remarks,
  };

  store.invoices.unshift(invoice);
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: "user-finance",
    action: "INVOICE_CREATED",
    entityType: "INVOICE",
    entityId: invoice.id,
    createdAt: normalizeTimestamp(),
  });

  return invoice;
}

export async function createGrantRecord(input: CreateGrantInput) {
  if (hasPrismaSource()) {
    try {
      const prisma = getPrismaClient();
      const grant = await prisma.grantRecord.create({
        data: {
          id: `grant-${randomUUID()}`,
          clientId: input.clientId,
          proposalDocumentId: input.proposalDocumentId,
          invoiceDocumentId: input.invoiceDocumentId,
          submissionReadiness: input.submissionReadiness,
          submissionStatus: input.submissionStatus,
          approvalStatus: input.approvalStatus,
          remarks: input.remarks,
        },
      });

      return mapPrismaGrant(grant);
    } catch {
      // Fall back to runtime storage when Prisma credentials are not yet usable.
    }
  }

  const store = getFallbackData();
  const grant: GrantRecord = {
    id: `grant-${randomUUID()}`,
    clientId: input.clientId,
    proposalDocumentId: input.proposalDocumentId,
    invoiceDocumentId: input.invoiceDocumentId,
    submissionReadiness: input.submissionReadiness,
    submissionStatus: input.submissionStatus,
    approvalStatus: input.approvalStatus,
    remarks: input.remarks,
  };

  store.grants.unshift(grant);
  store.auditLogs.unshift({
    id: `audit-${randomUUID()}`,
    actorId: "user-grant",
    action: "GRANT_RECORD_CREATED",
    entityType: "GRANT",
    entityId: grant.id,
    createdAt: normalizeTimestamp(),
  });

  return grant;
}
