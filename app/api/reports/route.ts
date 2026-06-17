import { getOptionalInternalSession } from "@/lib/auth";
import { getReportsView } from "@/lib/data-access";

export async function GET() {
  const session = await getOptionalInternalSession();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await getReportsView();

  return Response.json({
    metrics: reports.metrics,
    workload: reports.workload,
  });
}
