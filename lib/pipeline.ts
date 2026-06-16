import type { PipelineStage, StageTemplate } from "@/lib/domain";

export const stageTemplates: StageTemplate[] = [
  { key: "admin", name: "Admin", timelineGroup: "CLOSING_THE_CLIENT" },
  {
    key: "client-information",
    name: "Client Information",
    timelineGroup: "CLOSING_THE_CLIENT",
  },
  {
    key: "client-facing-proposal",
    name: "Client-Facing Proposal",
    timelineGroup: "CLOSING_THE_CLIENT",
  },
  {
    key: "client-facing-invoice",
    name: "Client-Facing Invoice",
    timelineGroup: "CLOSING_THE_CLIENT",
  },
  {
    key: "edg-grant-proposal",
    name: "EDG Grant Proposal",
    timelineGroup: "CLOSING_THE_CLIENT",
  },
  {
    key: "edg-grant-invoice",
    name: "EDG Grant Invoice",
    timelineGroup: "CLOSING_THE_CLIENT",
  },
  {
    key: "client-facing-roadmap",
    name: "Client-Facing Roadmap",
    timelineGroup: "DEVELOPMENT",
  },
  {
    key: "internal-roadmap",
    name: "Internal Roadmap",
    timelineGroup: "DEVELOPMENT",
  },
  {
    key: "handover-and-sign-off",
    name: "Handover and Sign-Off",
    timelineGroup: "FINAL_HANDOVER",
  },
] as const;

export function isValidDevelopmentStage(stageName: string) {
  return (
    stageName === "Client-Facing Roadmap" || stageName === "Internal Roadmap"
  );
}

export function buildClientStages(
  clientId: string,
  ownerId: string,
  startDate: string,
): PipelineStage[] {
  return stageTemplates.map((template, index) => ({
    id: `${clientId}-${template.key}`,
    clientId,
    templateKey: template.key,
    name: template.name,
    timelineGroup: template.timelineGroup,
    ownerId,
    status: index < 2 ? "IN_PROGRESS" : "NOT_STARTED",
    progress: index === 0 ? 60 : index === 1 ? 35 : 0,
    startDate,
    dueDate: startDate,
    blocker: false,
    approvalStatus: "DRAFT",
    remarks: "",
  }));
}
