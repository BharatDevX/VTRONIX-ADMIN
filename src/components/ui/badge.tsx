import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<BadgeTone, string> = {
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: BadgeTone;
}

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-lg border px-2 text-xs font-medium", toneClass[tone], className)}>
      {children}
    </span>
  );
}
