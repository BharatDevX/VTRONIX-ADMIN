import { CheckCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDeleteNotification, useMarkNotificationRead, useNotifications } from "@/features/notifications/hooks";
import { formatDateTime } from "@/lib/format";

export default function NotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const remove = useDeleteNotification();

  return (
    <div>
      <PageHeader description="Realtime notification center with read, unread, and delete workflows." eyebrow="Realtime" title="Notifications" />
      <div className="p-5">
        <Card>
          <CardContent>
            {notifications.data && notifications.data.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.data.map((notification) => (
                  <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between" key={notification.id}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{notification.title}</h3>
                        <StatusBadge value={notification.is_read ? "read" : "unread"} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.body}</p>
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDateTime(notification.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => void markRead.mutateAsync({ id: notification.id, is_read: !notification.is_read })} variant="outline">
                        <CheckCheck />
                        {notification.is_read ? "Unread" : "Read"}
                      </Button>
                      <Button onClick={() => void remove.mutateAsync(notification.id)} size="icon" title="Delete notification" variant="ghost">
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState description="New realtime alerts will arrive here." title="No notifications" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
