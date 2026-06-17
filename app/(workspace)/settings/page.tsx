import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { UserAdminPanel } from "@/components/settings/user-admin-panel";
import {
  listClients,
  listDocuments,
  listHandovers,
  listNotifications,
  listUsers,
} from "@/lib/data-access";
import {
  env,
  hasDatabaseConfig,
  hasSupabaseAuthConfig,
  hasSupabaseStorageConfig,
} from "@/lib/env";
import { canViewInternalData } from "@/lib/permissions";

export default async function SettingsPage() {
  const [users, clients, documents, handovers, notifications] = await Promise.all([
    listUsers(),
    listClients(),
    listDocuments(),
    listHandovers(),
    listNotifications(),
  ]);

  const internalUsers = users.filter((user) => canViewInternalData(user.role));
  const clientViewers = users.filter((user) => user.role === "CLIENT_VIEWER");
  const portalEnabledClients = clients.filter((client) =>
    documents.some((document) => document.clientId === client.id && document.clientFacing),
  ).length;
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const pendingHandovers = handovers.filter(
    (handover) => handover.signOffStatus !== "COMPLETED" && handover.signOffStatus !== "ARCHIVED",
  ).length;

  const readiness = [
    {
      label: "Database",
      ready: hasDatabaseConfig(),
      detail: env.databaseUrl ? "DATABASE_URL present" : "Waiting for DATABASE_URL",
    },
    {
      label: "Supabase auth",
      ready: hasSupabaseAuthConfig(),
      detail:
        env.supabaseUrl && env.supabasePublishableKey
          ? "Public auth keys detected"
          : "Missing Supabase auth URL or publishable key",
    },
    {
      label: "Supabase storage",
      ready: hasSupabaseStorageConfig(),
      detail:
        env.supabaseBucket && env.supabaseServiceRoleKey
          ? `Bucket ${env.supabaseBucket}`
          : "Missing storage bucket or service role key",
    },
    {
      label: "Email delivery",
      ready: Boolean(env.resendApiKey),
      detail: env.resendApiKey ? "Resend API key configured" : "Missing RESEND_API_KEY",
    },
    {
      label: "Gantt provider",
      ready: Boolean(env.ganttProvider),
      detail: `Provider: ${env.ganttProvider}`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Internal team
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{internalUsers.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Delivery operators with full internal workspace access.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Client viewers
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{clientViewers.length}</p>
          <p className="mt-2 text-sm text-slate-600">
            Portal-only users restricted from internal roadmap and time detail.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Portal-enabled clients
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{portalEnabledClients}</p>
          <p className="mt-2 text-sm text-slate-600">
            Clients already carrying client-facing documents in the system.
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Operational alerts
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{unreadNotifications}</p>
          <p className="mt-2 text-sm text-slate-600">
            Unread notifications and {pendingHandovers} active handover lanes.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            eyebrow="Configuration"
            title="System readiness"
            body="This page reflects the actual contracts the app is using for auth, storage, mail, database, and Gantt wiring."
          />
          <div className="space-y-3">
            {readiness.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                </div>
                <Badge tone={item.ready ? "success" : "warning"}>
                  {item.ready ? "Configured" : "Attention"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Security"
            title="Role boundaries"
            body="Client viewers stay behind the portal-safe layer while internal users can operate across the full workspace."
          />
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Internal roles
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(internalUsers.map((user) => user.role))).map((role) => (
                  <Badge key={role} tone="info">
                    {role.replaceAll("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600">
              Client viewers can only access approved client-facing documents and client-facing task context through the portal.
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4 text-sm text-slate-600">
              Internal pages, server actions, and reporting routes now require internal sessions instead of generic sign-in.
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader
            eyebrow="Team"
            title="Workspace roster"
            body="Admins can now add users and update role or capacity assignments directly from settings."
          />
          <UserAdminPanel users={users} />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Operations"
            title="Admin pulse"
            body="A quick control-room view of what still needs operator attention."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Total clients
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{clients.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Client-facing docs
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {documents.filter((document) => document.clientFacing).length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Active handovers
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingHandovers}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Unread alerts
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{unreadNotifications}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                App base URL
              </p>
              <p className="mt-2 font-semibold text-slate-950">{env.appUrl}</p>
              <p className="mt-2 text-sm text-slate-600">
                This is the route base used for auth redirects and shared links.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
