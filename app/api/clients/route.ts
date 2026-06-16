import { listClients } from "@/lib/data-access";

export async function GET() {
  const clients = await listClients();
  return Response.json({ clients });
}
