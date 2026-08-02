import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteNotification, getNotifications, markNotificationRead } from "@/features/notifications/service";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/services/supabase";

export function useNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        void queryClient.invalidateQueries({ queryKey: [queryKeys.notifications] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryFn: getNotifications,
    queryKey: [queryKeys.notifications],
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) => markNotificationRead(id, is_read),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKeys.notifications] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKeys.notifications] });
    },
  });
}
