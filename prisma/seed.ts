import { createRequire } from "node:module";

import { appData } from "@/lib/demo-data";
import { stageTemplates } from "@/lib/pipeline";

type PrismaWriteDelegate = {
  deleteMany: () => Promise<unknown>;
  createMany: (args: { data: unknown[] }) => Promise<unknown>;
};

type PrismaSeedClient = {
  auditLog: PrismaWriteDelegate;
  notification: PrismaWriteDelegate;
  timeLog: PrismaWriteDelegate;
  taskDependency: PrismaWriteDelegate;
  taskAssignment: PrismaWriteDelegate;
  subtask: PrismaWriteDelegate;
  task: PrismaWriteDelegate;
  documentVersion: PrismaWriteDelegate;
  document: PrismaWriteDelegate;
  implementationPlanTask: PrismaWriteDelegate;
  implementationPlan: PrismaWriteDelegate;
  clientPortalAccess: PrismaWriteDelegate;
  handoverRecord: PrismaWriteDelegate;
  grantRecord: PrismaWriteDelegate;
  invoiceRecord: PrismaWriteDelegate;
  proposalRecord: PrismaWriteDelegate;
  clientPipelineStage: PrismaWriteDelegate;
  pipelineStage: PrismaWriteDelegate;
  clientContact: PrismaWriteDelegate;
  client: PrismaWriteDelegate;
  user: PrismaWriteDelegate;
  $disconnect: () => Promise<void>;
};

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new () => PrismaSeedClient;
};

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timeLog.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.implementationPlanTask.deleteMany();
  await prisma.implementationPlan.deleteMany();
  await prisma.clientPortalAccess.deleteMany();
  await prisma.handoverRecord.deleteMany();
  await prisma.grantRecord.deleteMany();
  await prisma.invoiceRecord.deleteMany();
  await prisma.proposalRecord.deleteMany();
  await prisma.clientPipelineStage.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.clientContact.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: appData.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      capacityHours: user.capacityHours,
    })),
  });

  await prisma.pipelineStage.createMany({
    data: stageTemplates.map((template, index) => ({
      id: template.key,
      key: template.key,
      name: template.name,
      timelineGroup: template.timelineGroup,
      order: index + 1,
    })),
  });

  await prisma.client.createMany({
    data: appData.clients.map((client) => ({
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
    })),
  });

  await prisma.clientContact.createMany({
    data: appData.contacts.map((contact) => ({
      id: contact.id,
      clientId: contact.clientId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role,
      portalAccess: contact.portalAccess,
    })),
  });

  await prisma.clientPipelineStage.createMany({
    data: appData.stages.map((stage) => ({
      id: stage.id,
      clientId: stage.clientId,
      pipelineStageId: stage.templateKey,
      ownerId: stage.ownerId,
      status: stage.status,
      startDate: new Date(stage.startDate),
      dueDate: new Date(stage.dueDate),
      progress: stage.progress,
      blocker: stage.blocker,
      approvalStatus: stage.approvalStatus,
      remarks: stage.remarks,
    })),
  });

  await prisma.implementationPlan.createMany({
    data: appData.implementationPlans.map((plan) => ({
      id: plan.id,
      clientId: plan.clientId,
      clientStageId: plan.relatedStageId,
      name: plan.name,
      version: plan.version,
      status: plan.status,
      approvalStatus: plan.approvalStatus,
      uploadedById: plan.uploadedById,
      uploadDate: new Date(plan.uploadDate),
      sourceType: plan.sourceType,
      sourceReference: plan.sourceReference,
      remarks: plan.remarks,
    })),
  });

  await prisma.task.createMany({
    data: appData.tasks.map((task) => ({
      id: task.id,
      clientId: task.clientId,
      clientPipelineStageId: task.stageId,
      implementationPlanId: task.implementationPlanId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      primaryOwnerId: task.primaryOwnerId,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      completionPercent: task.completionPercent,
      blocker: task.blocker,
      clientFacing: task.clientFacing,
    })),
  });

  await prisma.taskAssignment.createMany({
    data: appData.tasks.flatMap((task) =>
      task.supportingMemberIds.map((userId) => ({
        taskId: task.id,
        userId,
        roleLabel: "SUPPORTING",
      })),
    ),
  });

  await prisma.taskDependency.createMany({
    data: appData.tasks.flatMap((task) =>
      task.dependencyIds.map((dependencyId) => ({
        predecessorId: dependencyId,
        successorId: task.id,
      })),
    ),
  });

  await prisma.document.createMany({
    data: appData.documents.map((document) => ({
      id: document.id,
      clientId: document.clientId,
      clientStageId: document.stageId,
      taskId: document.taskId,
      implementationPlanId: document.implementationPlanId,
      name: document.name,
      type: document.type,
      status: document.status,
      clientFacing: document.clientFacing,
    })),
  });

  await prisma.documentVersion.createMany({
    data: appData.documents.map((document) => ({
      id: `${document.id}-version`,
      documentId: document.id,
      versionLabel: document.version,
      storagePath: `demo/${document.name}`,
      mimeType: "application/octet-stream",
      status: document.status,
      uploadedById: document.uploadedById,
    })),
  });

  await prisma.timeLog.createMany({
    data: appData.timeLogs.map((log) => ({
      id: log.id,
      clientId: log.clientId,
      userId: log.userId,
      clientStageId: log.stageId,
      taskId: log.taskId,
      implementationPlanTaskId: log.implementationPlanTaskId,
      hours: log.hours,
      billable: log.billable,
      entryDate: new Date(log.entryDate),
      description: log.description,
    })),
  });

  await prisma.notification.createMany({
    data: appData.notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      read: notification.read,
      createdAt: new Date(notification.createdAt),
      updatedAt: new Date(notification.createdAt),
    })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
