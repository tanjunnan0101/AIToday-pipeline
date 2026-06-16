import { getDashboardView } from "@/lib/data-access";

export async function GET() {
  const dashboard = await getDashboardView();
  return Response.json({
    metrics: dashboard.metrics,
    upcomingMilestones: dashboard.recentTasks.slice(0, 3),
  });
}
