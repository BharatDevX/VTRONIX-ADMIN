import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
  variant?: "empty" | "error";
}

export function EmptyState({ actionLabel, description, onAction, title, variant = "empty" }: EmptyStateProps) {
  const Icon = variant === "error" ? AlertCircle : Inbox;

  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center dark:border-slate-800 dark:bg-slate-800/60">
      <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:shadow-none">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
