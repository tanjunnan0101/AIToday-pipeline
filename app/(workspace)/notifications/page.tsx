import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { listNotifications, listUsers } from "@/lib/data-access";

export default async function NotificationsPage() {
  const [notifications, users] = await Promise.all([listNotifications(), listUsers()]);

  return (
    <Card>
      <CardHeader
        eyebrow="Notifications"
        title="In-app alert stream"
        body="Email hooks and in-app notifications sit on the same event model."
      />
      <div className="space-y-3">
        {notifications.map((notification) => {
          const user = users.find((entry) => entry.id === notification.userId);

          return (
            <div key={notification.id} className="rounded-2xl border border-slate-200/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {user?.name ?? "Unknown user"}
                  </p>
                </div>
                <Badge tone={notification.read ? "default" : "warning"}>
                  {notification.read ? "Read" : "Unread"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
