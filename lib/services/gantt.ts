import type { Task } from "@/lib/domain";

export type GanttEntry = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  progress: number;
  assigneeId: string;
};

export interface GanttProvider {
  name: string;
  toEntries(tasks: Task[]): GanttEntry[];
}

export const timelineAdapter: GanttProvider = {
  name: "timeline-adapter",
  toEntries(tasks) {
    return tasks.map((task) => ({
      id: task.id,
      label: task.title,
      startDate: task.startDate,
      endDate: task.endDate,
      progress: task.completionPercent,
      assigneeId: task.primaryOwnerId,
    }));
  },
};
