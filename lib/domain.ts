export const userRoles = [
  "ADMIN",
  "PROJECT_MANAGER",
  "CONSULTANT",
  "DEVELOPER",
  "GRANT_WRITER",
  "FINANCE",
  "DESIGNER",
  "CLIENT_VIEWER",
] as const;

export const timelineGroups = [
  "CLOSING_THE_CLIENT",
  "DEVELOPMENT",
  "FINAL_HANDOVER",
] as const;

export const taskStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "WAITING_ON_CLIENT",
  "WAITING_ON_INTERNAL_REVIEW",
  "WAITING_ON_GRANT_APPROVAL",
  "COMPLETED",
  "BLOCKED",
] as const;

export const clientStatuses = [
  "LEAD",
  "CLOSING",
  "CLOSED",
  "ONBOARDING",
  "IN_DELIVERY",
  "PENDING_CLIENT_ACTION",
  "PENDING_GRANT_ACTION",
  "PENDING_HANDOVER",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const documentStatuses = [
  "MISSING",
  "DRAFT",
  "UPLOADED",
  "INTERNAL_REVIEW",
  "SENT_TO_CLIENT",
  "CLIENT_APPROVED",
  "APPROVED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;

export const documentTypes = [
  "IMPLEMENTATION_PLAN",
  "CLIENT_FACING_PROPOSAL",
  "CLIENT_FACING_INVOICE",
  "EDG_GRANT_PROPOSAL",
  "EDG_GRANT_INVOICE",
  "CLIENT_FACING_ROADMAP",
  "INTERNAL_ROADMAP",
  "SIGN_OFF_DOCUMENT",
  "SUPPORTING_DOCUMENT",
  "CONTRACT",
  "PAYMENT_PROOF",
  "CLIENT_INFORMATION_FORM",
  "MEETING_NOTES",
  "WORKFLOW_DIAGRAM",
] as const;

export const implementationPlanStatuses = [
  "DRAFT",
  "INTERNAL_REVIEW",
  "SENT_TO_CLIENT",
  "CLIENT_APPROVED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;

export const paymentStatuses = [
  "NOT_ISSUED",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export const approvalStatuses = [
  "DRAFT",
  "INTERNAL_REVIEW",
  "SENT",
  "APPROVED",
  "REJECTED",
  "REVISED",
  "SUPERSEDED",
] as const;

export const signOffStatuses = [
  "NOT_STARTED",
  "PREPARING",
  "SENT_TO_CLIENT",
  "PENDING_CLIENT_SIGNATURE",
  "SIGNED",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type UserRole = (typeof userRoles)[number];
export type TimelineGroup = (typeof timelineGroups)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type ClientStatus = (typeof clientStatuses)[number];
export type Priority = (typeof priorities)[number];
export type DocumentStatus = (typeof documentStatuses)[number];
export type DocumentType = (typeof documentTypes)[number];
export type ImplementationPlanStatus = (typeof implementationPlanStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type ApprovalStatus = (typeof approvalStatuses)[number];
export type SignOffStatus = (typeof signOffStatuses)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  capacityHours: number;
};

export type StageTemplate = {
  key: string;
  name: string;
  timelineGroup: TimelineGroup;
};

export type PipelineStage = {
  id: string;
  clientId: string;
  templateKey: string;
  name: string;
  timelineGroup: TimelineGroup;
  ownerId: string;
  status: TaskStatus;
  progress: number;
  startDate: string;
  dueDate: string;
  blocker: boolean;
  approvalStatus: ApprovalStatus;
  remarks: string;
};

export type ClientContact = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  portalAccess: boolean;
};

export type Client = {
  id: string;
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

export type Task = {
  id: string;
  clientId: string;
  stageId: string;
  implementationPlanId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  primaryOwnerId: string;
  supportingMemberIds: string[];
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  completionPercent: number;
  dependencyIds: string[];
  blocker: boolean;
  clientFacing: boolean;
};

export type Subtask = {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  completionPercent: number;
};

export type DocumentRecord = {
  id: string;
  clientId: string;
  stageId?: string;
  taskId?: string;
  implementationPlanId?: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  version: string;
  uploadedAt: string;
  uploadedById: string;
  clientFacing: boolean;
  storageObjectPath?: string;
};

export type ImplementationPlan = {
  id: string;
  clientId: string;
  relatedStageId: string;
  name: string;
  version: string;
  status: ImplementationPlanStatus;
  approvalStatus: ApprovalStatus;
  uploadedById: string;
  uploadDate: string;
  sourceType: "FILE" | "GOOGLE_DRIVE" | "EXTERNAL_URL";
  sourceReference: string;
  remarks: string;
};

export type TimeLog = {
  id: string;
  clientId: string;
  taskId?: string;
  implementationPlanTaskId?: string;
  userId: string;
  stageId: string;
  hours: number;
  billable: boolean;
  entryDate: string;
  description: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ProposalRecord = {
  id: string;
  clientId: string;
  documentId: string;
  sentDate: string;
  approvalStatus: ApprovalStatus;
  clientComments: string;
  approvedDate?: string;
};

export type InvoiceRecord = {
  id: string;
  clientId: string;
  documentId: string;
  invoiceNumber: string;
  amount: number;
  status: PaymentStatus;
  sentDate: string;
  paidDate?: string;
  remarks?: string;
};

export type GrantRecord = {
  id: string;
  clientId: string;
  proposalDocumentId: string;
  invoiceDocumentId: string;
  submissionReadiness: string;
  submissionStatus: TaskStatus;
  approvalStatus: ApprovalStatus;
  remarks?: string;
};

export type HandoverRecord = {
  id: string;
  clientId: string;
  checklist: string[];
  signOffStatus: SignOffStatus;
  walkthroughDate: string;
  signedBy?: string;
  signOffDate?: string;
  pendingActions: string[];
  closureNotes?: string;
};

export type CommentRecord = {
  id: string;
  entityType: "CLIENT" | "TASK" | "DOCUMENT" | "IMPLEMENTATION_PLAN";
  entityId: string;
  authorId: string;
  message: string;
  clientFacing: boolean;
  createdAt: string;
};

export type AuditLogRecord = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

export type PortalAccess = {
  id: string;
  clientId: string;
  contactId: string;
  approvedDocumentIds: string[];
};

export type AppData = {
  users: User[];
  clients: Client[];
  contacts: ClientContact[];
  stages: PipelineStage[];
  tasks: Task[];
  subtasks: Subtask[];
  documents: DocumentRecord[];
  implementationPlans: ImplementationPlan[];
  timeLogs: TimeLog[];
  notifications: Notification[];
  proposals: ProposalRecord[];
  invoices: InvoiceRecord[];
  grants: GrantRecord[];
  handovers: HandoverRecord[];
  comments: CommentRecord[];
  auditLogs: AuditLogRecord[];
  portalAccess: PortalAccess[];
};
