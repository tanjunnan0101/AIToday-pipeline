import { listTasks } from "@/lib/data-access";

export async function GET() {
  const tasks = await listTasks();

  return Response.json({ tasks });
}
