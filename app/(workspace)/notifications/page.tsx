import { NotificationsWorkspace } from "@/components/notifications/notifications-workspace";
import { listNotifications, listUsers } from "@/lib/data-access";

export default async function NotificationsPage() {
  const [notifications, users] = await Promise.all([listNotifications(), listUsers()]);

  return <NotificationsWorkspace notifications={notifications} users={users} />;
}
