import Link from "next/link";

import { CreateClientForm } from "@/components/clients/create-client-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listClients, listUsers } from "@/lib/data-access";
import { formatCurrency } from "@/lib/utils";

export default async function ClientsPage() {
  const [clients, users] = await Promise.all([listClients(), listUsers()]);
  const owners = users.filter((user) => user.role !== "CLIENT_VIEWER");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <Card>
        <CardHeader
          eyebrow="Client management"
          title="Portfolio"
          body="Each client receives the full nine-stage pipeline automatically, with roadmap-only development grouping."
        />
        <div className="grid gap-4">
          {clients.map((client) => {
            const owner = users.find((user) => user.id === client.accountOwnerId);

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="grid gap-4 rounded-2xl border border-slate-200/70 p-5 transition hover:border-cyan-300 hover:bg-cyan-50/50 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr]"
              >
                <div>
                  <p className="font-semibold text-slate-950">{client.companyName}</p>
                  <p className="mt-1 text-sm text-slate-600">{client.industry}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Owner</p>
                  <p className="mt-2 font-medium text-slate-900">{owner?.name}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Value</p>
                  <p className="mt-2 font-medium text-slate-900">
                    {formatCurrency(client.projectValue)}
                  </p>
                </div>
                <div className="md:text-right">
                  <Badge tone="info">{client.status.replaceAll("_", " ")}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="First live mutation"
          title="Add client"
          body="This form creates the client record and auto-creates the full nine-stage pipeline in the active data source."
        />
        <CreateClientForm owners={owners} />
      </Card>
    </div>
  );
}
