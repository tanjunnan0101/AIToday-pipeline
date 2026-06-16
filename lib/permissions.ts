import type { DocumentRecord, Task, UserRole } from "@/lib/domain";

export function canViewInternalData(role: UserRole) {
  return role !== "CLIENT_VIEWER";
}

export function filterPortalDocuments(documents: DocumentRecord[]) {
  return documents.filter(
    (document) =>
      document.clientFacing &&
      (document.status === "APPROVED" ||
        document.status === "CLIENT_APPROVED" ||
        document.status === "SENT_TO_CLIENT"),
  );
}

export function filterPortalTasks(tasks: Task[]) {
  return tasks.filter((task) => task.clientFacing);
}
