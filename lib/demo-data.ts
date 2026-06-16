import type { AppData, Client, PipelineStage, Task, User } from "@/lib/domain";
import { buildClientStages } from "@/lib/pipeline";

const users: User[] = [
  {
    id: "user-admin",
    name: "Tanja Nunn",
    email: "admin@aitoday.sg",
    role: "ADMIN",
    avatar: "TN",
    capacityHours: 40,
  },
  {
    id: "user-pm",
    name: "Alicia Tan",
    email: "pm@aitoday.sg",
    role: "PROJECT_MANAGER",
    avatar: "AT",
    capacityHours: 38,
  },
  {
    id: "user-consultant",
    name: "Marcus Goh",
    email: "consultant@aitoday.sg",
    role: "CONSULTANT",
    avatar: "MG",
    capacityHours: 34,
  },
  {
    id: "user-dev",
    name: "Rina Lim",
    email: "dev@aitoday.sg",
    role: "DEVELOPER",
    avatar: "RL",
    capacityHours: 42,
  },
  {
    id: "user-grant",
    name: "Farah Noor",
    email: "grant@aitoday.sg",
    role: "GRANT_WRITER",
    avatar: "FN",
    capacityHours: 36,
  },
  {
    id: "user-finance",
    name: "Joel Ng",
    email: "finance@aitoday.sg",
    role: "FINANCE",
    avatar: "JN",
    capacityHours: 30,
  },
  {
    id: "user-designer",
    name: "Celine Yap",
    email: "design@aitoday.sg",
    role: "DESIGNER",
    avatar: "CY",
    capacityHours: 35,
  },
  {
    id: "user-client",
    name: "Kiu Hair Team",
    email: "portal@kiuhair.com",
    role: "CLIENT_VIEWER",
    avatar: "KH",
    capacityHours: 0,
  },
];

const clients: Client[] = [
  {
    id: "client-kiu",
    companyName: "Kiu Hair Gallery",
    uen: "201923456W",
    industry: "Beauty & Wellness",
    projectValue: 64000,
    grantType: "EDG",
    status: "IN_DELIVERY",
    accountOwnerId: "user-pm",
    startDate: "2026-06-02",
    targetHandoverDate: "2026-08-01",
    notes: "Flagship digital workflow rollout with salon operations dashboard.",
  },
  {
    id: "client-ca",
    companyName: "C&A Auto Leasing",
    uen: "201845612D",
    industry: "Mobility",
    projectValue: 82000,
    grantType: "EDG",
    status: "CLOSING",
    accountOwnerId: "user-consultant",
    startDate: "2026-06-05",
    targetHandoverDate: "2026-08-20",
    notes: "Proposal, invoice, and internal roadmap need tight milestone control.",
  },
  {
    id: "client-retail",
    companyName: "Sample Retail Client",
    uen: "201712312M",
    industry: "Retail",
    projectValue: 51000,
    grantType: "Productivity Solutions",
    status: "PENDING_HANDOVER",
    accountOwnerId: "user-pm",
    startDate: "2026-05-18",
    targetHandoverDate: "2026-07-10",
    notes: "Approaching final sign-off with document pack and walkthrough pending.",
  },
];

const stages: PipelineStage[] = clients.flatMap((client) =>
  buildClientStages(client.id, client.accountOwnerId, client.startDate),
);

function stageId(clientId: string, templateKey: string) {
  return `${clientId}-${templateKey}`;
}

const tasks: Task[] = [
  {
    id: "task-1",
    clientId: "client-kiu",
    stageId: stageId("client-kiu", "client-facing-roadmap"),
    title: "Approve salon omnichannel roadmap",
    description: "Lock milestone dates and client-facing deliverables.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    primaryOwnerId: "user-pm",
    supportingMemberIds: ["user-consultant", "user-designer"],
    startDate: "2026-06-14",
    endDate: "2026-06-20",
    estimatedHours: 12,
    actualHours: 6,
    completionPercent: 50,
    dependencyIds: [],
    blocker: false,
    clientFacing: true,
  },
  {
    id: "task-2",
    clientId: "client-kiu",
    stageId: stageId("client-kiu", "internal-roadmap"),
    implementationPlanId: "plan-kiu-v2",
    title: "Configure operator workload lanes",
    description: "Model detailed staffing, training, and rollout work in the zoom view.",
    status: "BLOCKED",
    priority: "URGENT",
    primaryOwnerId: "user-dev",
    supportingMemberIds: ["user-designer"],
    startDate: "2026-06-16",
    endDate: "2026-06-23",
    estimatedHours: 18,
    actualHours: 11,
    completionPercent: 42,
    dependencyIds: ["task-1"],
    blocker: true,
    clientFacing: false,
  },
  {
    id: "task-3",
    clientId: "client-ca",
    stageId: stageId("client-ca", "client-facing-proposal"),
    title: "Refine funding narrative for fleet automation",
    description: "Capture the EDG framing and financial model for submission readiness.",
    status: "WAITING_ON_CLIENT",
    priority: "HIGH",
    primaryOwnerId: "user-grant",
    supportingMemberIds: ["user-consultant"],
    startDate: "2026-06-12",
    endDate: "2026-06-21",
    estimatedHours: 14,
    actualHours: 9,
    completionPercent: 70,
    dependencyIds: [],
    blocker: false,
    clientFacing: true,
  },
  {
    id: "task-4",
    clientId: "client-ca",
    stageId: stageId("client-ca", "edg-grant-invoice"),
    title: "Reconcile EDG invoice pack",
    description: "Validate payment proof, grant invoice, and supporting attachments.",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    primaryOwnerId: "user-finance",
    supportingMemberIds: ["user-grant"],
    startDate: "2026-06-22",
    endDate: "2026-06-28",
    estimatedHours: 9,
    actualHours: 0,
    completionPercent: 0,
    dependencyIds: ["task-3"],
    blocker: false,
    clientFacing: false,
  },
  {
    id: "task-5",
    clientId: "client-retail",
    stageId: stageId("client-retail", "handover-and-sign-off"),
    title: "Prepare final walkthrough pack",
    description: "Bundle handover checklist, recordings, final docs, and sign-off request.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    primaryOwnerId: "user-pm",
    supportingMemberIds: ["user-dev", "user-finance"],
    startDate: "2026-06-13",
    endDate: "2026-06-19",
    estimatedHours: 16,
    actualHours: 10,
    completionPercent: 64,
    dependencyIds: [],
    blocker: false,
    clientFacing: true,
  },
];

export const appData: AppData = {
  users,
  clients,
  contacts: [
    {
      id: "contact-1",
      clientId: "client-kiu",
      name: "Grace Ong",
      email: "grace@kiuhair.com",
      phone: "+65 9012 3456",
      role: "Operations Lead",
      portalAccess: true,
    },
    {
      id: "contact-2",
      clientId: "client-ca",
      name: "Daniel Soh",
      email: "daniel@caauto.com",
      phone: "+65 9123 1234",
      role: "Managing Director",
      portalAccess: false,
    },
    {
      id: "contact-3",
      clientId: "client-retail",
      name: "Asha Menon",
      email: "asha@sampleretail.com",
      phone: "+65 9555 1820",
      role: "Transformation Lead",
      portalAccess: true,
    },
  ],
  stages,
  tasks,
  documents: [
    {
      id: "doc-1",
      clientId: "client-kiu",
      stageId: stageId("client-kiu", "client-facing-roadmap"),
      implementationPlanId: "plan-kiu-v2",
      name: "Kiu Roadmap v2",
      type: "CLIENT_FACING_ROADMAP",
      status: "CLIENT_APPROVED",
      version: "v2",
      uploadedAt: "2026-06-13",
      uploadedById: "user-pm",
      clientFacing: true,
    },
    {
      id: "doc-2",
      clientId: "client-ca",
      stageId: stageId("client-ca", "client-facing-proposal"),
      name: "EDG Proposal Deck",
      type: "CLIENT_FACING_PROPOSAL",
      status: "INTERNAL_REVIEW",
      version: "v3",
      uploadedAt: "2026-06-15",
      uploadedById: "user-grant",
      clientFacing: true,
    },
    {
      id: "doc-3",
      clientId: "client-retail",
      stageId: stageId("client-retail", "handover-and-sign-off"),
      name: "Sign-off Pack",
      type: "SIGN_OFF_DOCUMENT",
      status: "SENT_TO_CLIENT",
      version: "v1",
      uploadedAt: "2026-06-14",
      uploadedById: "user-pm",
      clientFacing: true,
    },
  ],
  implementationPlans: [
    {
      id: "plan-kiu-v2",
      clientId: "client-kiu",
      relatedStageId: stageId("client-kiu", "internal-roadmap"),
      name: "Kiu Enablement Blueprint",
      version: "v2",
      status: "INTERNAL_REVIEW",
      approvalStatus: "INTERNAL_REVIEW",
      uploadedById: "user-dev",
      uploadDate: "2026-06-15",
      sourceType: "FILE",
      sourceReference: "kiu-blueprint-v2.pdf",
      remarks: "Detailed operational rollout for salon branches and back-office.",
    },
    {
      id: "plan-ca-v1",
      clientId: "client-ca",
      relatedStageId: stageId("client-ca", "client-facing-roadmap"),
      name: "Fleet Dispatch Rollout",
      version: "v1",
      status: "DRAFT",
      approvalStatus: "DRAFT",
      uploadedById: "user-consultant",
      uploadDate: "2026-06-14",
      sourceType: "GOOGLE_DRIVE",
      sourceReference: "https://drive.google.com/drive/u/0/folders/fleet-rollout",
      remarks: "Initial sequencing for branch onboarding and control-room workflows.",
    },
  ],
  timeLogs: [
    {
      id: "time-1",
      clientId: "client-kiu",
      taskId: "task-1",
      userId: "user-pm",
      stageId: stageId("client-kiu", "client-facing-roadmap"),
      hours: 4.5,
      billable: true,
      entryDate: "2026-06-15",
      description: "Roadmap approval workshop and milestone adjustments.",
    },
    {
      id: "time-2",
      clientId: "client-kiu",
      taskId: "task-2",
      userId: "user-dev",
      stageId: stageId("client-kiu", "internal-roadmap"),
      hours: 6.5,
      billable: true,
      entryDate: "2026-06-15",
      description: "Modelled workload lanes and blocker resolution options.",
    },
    {
      id: "time-3",
      clientId: "client-retail",
      taskId: "task-5",
      userId: "user-finance",
      stageId: stageId("client-retail", "handover-and-sign-off"),
      hours: 2,
      billable: false,
      entryDate: "2026-06-14",
      description: "Final payment evidence review.",
    },
  ],
  notifications: [
    {
      id: "notif-1",
      userId: "user-pm",
      title: "Kiu blueprint blocked",
      body: "Implementation workload lanes are waiting on staffing assumptions.",
      createdAt: "2026-06-15T09:00:00Z",
      read: false,
    },
    {
      id: "notif-2",
      userId: "user-grant",
      title: "C&A proposal waiting on client",
      body: "Financial attachment revisions were requested by the client.",
      createdAt: "2026-06-14T18:20:00Z",
      read: false,
    },
  ],
  proposals: [
    {
      id: "proposal-1",
      clientId: "client-ca",
      documentId: "doc-2",
      sentDate: "2026-06-14",
      approvalStatus: "INTERNAL_REVIEW",
      clientComments: "Awaiting revised assumptions.",
    },
  ],
  invoices: [
    {
      id: "invoice-1",
      clientId: "client-ca",
      documentId: "doc-2",
      invoiceNumber: "INV-2026-118",
      amount: 12500,
      status: "ISSUED",
      sentDate: "2026-06-13",
    },
  ],
  grants: [
    {
      id: "grant-1",
      clientId: "client-ca",
      proposalDocumentId: "doc-2",
      invoiceDocumentId: "doc-2",
      submissionReadiness: "Financial annex pending client confirmation.",
      submissionStatus: "WAITING_ON_CLIENT",
      approvalStatus: "INTERNAL_REVIEW",
    },
  ],
  handovers: [
    {
      id: "handover-1",
      clientId: "client-retail",
      signOffStatus: "SENT_TO_CLIENT",
      walkthroughDate: "2026-06-19",
      pendingActions: ["Confirm recording access", "Return signed closure sheet"],
    },
  ],
  comments: [
    {
      id: "comment-1",
      entityType: "TASK",
      entityId: "task-2",
      authorId: "user-dev",
      message: "Need final headcount assumptions before locking the internal roadmap.",
      clientFacing: false,
      createdAt: "2026-06-15T08:45:00Z",
    },
    {
      id: "comment-2",
      entityType: "IMPLEMENTATION_PLAN",
      entityId: "plan-kiu-v2",
      authorId: "user-pm",
      message: "Client-facing milestones are good; keep delegation detail internal.",
      clientFacing: false,
      createdAt: "2026-06-15T10:15:00Z",
    },
  ],
  auditLogs: [
    {
      id: "audit-1",
      actorId: "user-pm",
      action: "CLIENT_STAGE_UPDATED",
      entityType: "CLIENT_PIPELINE_STAGE",
      entityId: stageId("client-retail", "handover-and-sign-off"),
      createdAt: "2026-06-15T07:30:00Z",
    },
  ],
  portalAccess: [
    {
      id: "portal-1",
      clientId: "client-kiu",
      contactId: "contact-1",
      approvedDocumentIds: ["doc-1"],
    },
    {
      id: "portal-2",
      clientId: "client-retail",
      contactId: "contact-3",
      approvedDocumentIds: ["doc-3"],
    },
  ],
};

export function getDashboardMetrics() {
  const totalClients = clients.length;
  const activeClients = clients.filter((client) => client.status !== "ARCHIVED").length;
  const totalHours = appData.timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const billableHours = appData.timeLogs
    .filter((log) => log.billable)
    .reduce((sum, log) => sum + log.hours, 0);
  const blockedTasks = tasks.filter((task) => task.blocker).length;
  const overdueTasks = tasks.filter(
    (task) => task.status !== "COMPLETED" && new Date(task.endDate) < new Date("2026-06-15"),
  ).length;
  const missingDocuments = stages.filter(
    (stage) => !appData.documents.some((document) => document.stageId === stage.id),
  ).length;

  return {
    totalClients,
    activeClients,
    totalHours,
    billableHours,
    nonBillableHours: totalHours - billableHours,
    blockedTasks,
    overdueTasks,
    missingDocuments,
  };
}

export function getClientBundle(clientId: string) {
  return {
    client: clients.find((entry) => entry.id === clientId),
    contacts: appData.contacts.filter((entry) => entry.clientId === clientId),
    stages: stages.filter((entry) => entry.clientId === clientId),
    tasks: tasks.filter((entry) => entry.clientId === clientId),
    documents: appData.documents.filter((entry) => entry.clientId === clientId),
    implementationPlans: appData.implementationPlans.filter(
      (entry) => entry.clientId === clientId,
    ),
    handover: appData.handovers.find((entry) => entry.clientId === clientId),
  };
}

export function getPlanWorkspace(planId: string) {
  const plan = appData.implementationPlans.find((entry) => entry.id === planId);
  if (!plan) {
    return null;
  }

  const planTasks = tasks.filter((task) => task.implementationPlanId === plan.id);
  return {
    plan,
    client: clients.find((entry) => entry.id === plan.clientId),
    tasks: planTasks,
    documents: appData.documents.filter(
      (document) => document.implementationPlanId === plan.id,
    ),
    comments: appData.comments.filter(
      (comment) => comment.entityType === "IMPLEMENTATION_PLAN" && comment.entityId === plan.id,
    ),
  };
}

export function getUserById(userId: string) {
  return users.find((user) => user.id === userId);
}

export function getStageById(entryId: string) {
  return stages.find((stage) => stage.id === entryId);
}
