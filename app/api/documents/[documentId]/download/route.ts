import { NextResponse } from "next/server";

import { getOptionalSession } from "@/lib/auth";
import { createAuditLogRecord, getDocumentById } from "@/lib/data-access";
import { canAccessDocument } from "@/lib/permissions";
import { resolveStorageObjectUrl } from "@/lib/services/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const [document, session] = await Promise.all([
    getDocumentById(documentId),
    getOptionalSession(),
  ]);

  if (!document || !document.storageObjectPath) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  if (!canAccessDocument(document, session)) {
    return NextResponse.json({ error: "You do not have access to this document." }, { status: 403 });
  }

  const signedUrl = await resolveStorageObjectUrl(document.storageObjectPath, {
    downloadFileName: `${document.name}-${document.version}`,
  });

  if (!signedUrl) {
    return NextResponse.json({ error: "Document file is unavailable." }, { status: 404 });
  }

  await createAuditLogRecord({
    actorId: session?.id ?? "portal-public",
    action: session ? "DOCUMENT_DOWNLOADED" : "PORTAL_DOCUMENT_DOWNLOADED",
    entityType: "DOCUMENT",
    entityId: document.id,
  });

  return NextResponse.redirect(signedUrl);
}
