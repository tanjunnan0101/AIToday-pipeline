import { getOptionalInternalSession } from "@/lib/auth";
import { getDashboardView } from "@/lib/data-access";

export async function GET() {
  const session = await getOptionalInternalSession();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const dashboard = await getDashboardView();
  return Response.json({
    metrics: dashboard.metrics,
    upcomingMilestones: dashboard.recentTasks.slice(0, 3),
  });
}
