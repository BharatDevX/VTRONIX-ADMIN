import { cn } from "@/lib/utils";

export function inputClassName(className?: string) {
  return cn(
    "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-400 dark:focus:ring-slate-900/10",
    className,
  );
}
