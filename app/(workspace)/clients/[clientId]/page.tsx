import { ClientDetail } from "@/components/clients/client-detail";
import { getClientBundleById, listUsers } from "@/lib/data-access";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const [bundle, users] = await Promise.all([
    getClientBundleById(clientId),
    listUsers(),
  ]);

  return <ClientDetail bundle={bundle} users={users} />;
}
