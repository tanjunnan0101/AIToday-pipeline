import { getReportsView } from "@/lib/data-access";

export async function GET() {
  const reports = await getReportsView();

  return Response.json({
    metrics: reports.metrics,
    workload: reports.workload,
  });
}
