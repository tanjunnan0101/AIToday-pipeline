import { NextResponse } from "next/server";

import { getOptionalSession } from "@/lib/auth";
import { createAuditLogRecord, getImplementationPlanById } from "@/lib/data-access";
import { canViewInternalData } from "@/lib/permissions";
import { resolveStorageObjectUrl } from "@/lib/services/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  const [plan, session] = await Promise.all([
    getImplementationPlanById(planId),
    getOptionalSession(),
  ]);

  if (!plan) {
    return NextResponse.json({ error: "Implementation plan not found." }, { status: 404 });
  }

  if (!session || !canViewInternalData(session.role)) {
    return NextResponse.json({ error: "You do not have access to this source file." }, { status: 403 });
  }

  if (plan.sourceType !== "FILE") {
    return NextResponse.redirect(plan.sourceReference);
  }

  const signedUrl = await resolveStorageObjectUrl(plan.sourceReference, {
    downloadFileName: `${plan.name}-${plan.version}`,
  });

  if (!signedUrl) {
    return NextResponse.json({ error: "Implementation plan source file is unavailable." }, { status: 404 });
  }

  await createAuditLogRecord({
    actorId: session.id,
    action: "IMPLEMENTATION_PLAN_SOURCE_DOWNLOADED",
    entityType: "IMPLEMENTATION_PLAN",
    entityId: plan.id,
  });

  return NextResponse.redirect(signedUrl);
}
