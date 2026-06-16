import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listClients, listHandovers } from "@/lib/data-access";

export default async function HandoverPage() {
  const [clients, handovers] = await Promise.all([listClients(), listHandovers()]);

  return (
    <Card>
      <CardHeader
        eyebrow="Final handover"
        title="Sign-off workflow"
        body="Checklist, walkthrough, pending actions, and signed-by details sit inside this formal closure lane."
      />
      <div className="space-y-4">
        {handovers.map((handover) => {
          const client = clients.find((entry) => entry.id === handover.clientId);

          return (
            <div key={handover.id} className="rounded-2xl border border-slate-200/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {client?.companyName ?? handover.clientId}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Walkthrough {handover.walkthroughDate}
                  </p>
                </div>
                <Badge tone="warning">{handover.signOffStatus.replaceAll("_", " ")}</Badge>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {handover.pendingActions.map((action) => (
                  <li key={action}>- {action}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
