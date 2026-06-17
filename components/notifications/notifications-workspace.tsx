"use client";

import { useActionState, useMemo, useState } from "react";

import {
  updateNotificationAction,
  type UpdateNotificationFormState,
} from "@/app/(workspace)/notifications/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import type { Notification, User } from "@/lib/domain";

const initialState: UpdateNotificationFormState = {};

function NotificationToggle({
  notificationId,
  read,
}: {
  notificationId: string;
  read: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateNotificationAction, initialState);

  return (
    <form action={formAction}>
      <input name="notificationId" type="hidden" value={notificationId} />
      <input name="read" type="hidden" value={read ? "false" : "true"} />
      <button
        className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : read ? "Mark unread" : "Mark read"}
      </button>
      {state.message ? <p className="mt-2 text-xs text-slate-500">{state.message}</p> : null}
    </form>
  );
}

export function NotificationsWorkspace({
  notifications,
  users,
}: {
  notifications: Notification[];
  users: User[];
}) {
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((notification) => !notification.read);
    }

    if (filter === "READ") {
      return notifications.filter((notification) => notification.read);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total alerts
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{notifications.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Unread
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{unreadCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Coverage
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{users.length}</p>
          <p className="mt-2 text-sm text-slate-600">Tracked recipients in the workspace.</p>
        </Card>
      </section>

      <Card>
        <CardHeader
          eyebrow="Notifications"
          title="In-app alert stream"
          body="Email hooks and in-app notifications sit on the same event model, and read state now updates from the workspace."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["ALL", "All"],
            ["UNREAD", "Unread"],
            ["READ", "Read"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === value
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 text-slate-700"
              }`}
              onClick={() => setFilter(value as "ALL" | "UNREAD" | "READ")}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const user = users.find((entry) => entry.id === notification.userId);

            return (
              <div key={notification.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{notification.title}</p>
                      <Badge tone={notification.read ? "default" : "warning"}>
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {user?.name ?? "Unknown user"} | {notification.createdAt}
                    </p>
                  </div>
                  <NotificationToggle
                    notificationId={notification.id}
                    read={notification.read}
                  />
                </div>
              </div>
            );
          })}

          {!filteredNotifications.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
              No notifications in this filter.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
