import { getOptionalInternalSession } from "@/lib/auth";
import { listTasks } from "@/lib/data-access";

export async function GET() {
  const session = await getOptionalInternalSession();
  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await listTasks();

  return Response.json({ tasks });
}
