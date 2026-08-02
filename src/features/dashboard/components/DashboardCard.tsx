import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  accent?: string;
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function DashboardCard({
  accent = "bg-slate-950",
  icon,
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{value}</h2>
          </div>
          <div className={`flex size-11 items-center justify-center rounded-xl text-white ${accent}`}>
            {icon ?? <ArrowUpRight className="size-5" />}
          </div>
        </div>
        {subtitle ? <p className="mt-3 text-sm font-medium text-emerald-600">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}
