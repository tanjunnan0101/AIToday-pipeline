import type { DocumentRecord, Task, UserRole } from "@/lib/domain";

type SessionLike = {
  role: UserRole;
} & Record<string, unknown>;

export function canViewInternalData(role: UserRole) {
  return role !== "CLIENT_VIEWER";
}

export function isPortalVisibleDocument(document: DocumentRecord) {
  return (
    document.clientFacing &&
    (document.status === "APPROVED" ||
      document.status === "CLIENT_APPROVED" ||
      document.status === "SENT_TO_CLIENT")
  );
}

export function filterPortalDocuments(documents: DocumentRecord[]) {
  return documents.filter((document) => isPortalVisibleDocument(document));
}

export function filterPortalTasks(tasks: Task[]) {
  return tasks.filter((task) => task.clientFacing);
}

export function canAccessDocument(
  document: DocumentRecord,
  session?: SessionLike | null,
) {
  if (!session) {
    return isPortalVisibleDocument(document);
  }

  if (canViewInternalData(session.role)) {
    return true;
  }

  return isPortalVisibleDocument(document);
}
