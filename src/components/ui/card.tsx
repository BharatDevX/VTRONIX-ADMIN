import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:shadow-none",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("border-b border-slate-100 p-5", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
