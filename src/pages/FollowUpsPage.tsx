import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { getAdminFollowUps, type AdminFollowUpRecord } from "@/features/followUps/service";

export default function FollowUpsPage() {
  const [records,setRecords]=useState<AdminFollowUpRecord[]>([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState<"all"|"pending"|"completed"|"delayed">("all");

  useEffect(()=>{void (async()=>{try{setRecords(await getAdminFollowUps());}finally{setLoading(false);}})();},[]);

  const filtered=useMemo(()=>records.filter(r=>filter==="all"?true:filter==="pending"? !r.completed:filter==="completed"?r.completed:r.completed&&r.delay_days>0),[records,filter]);
  const pending=records.filter(r=>!r.completed).length;
  const completed=records.filter(r=>r.completed).length;
  const delayed=records.filter(r=>r.completed&&r.delay_days>0).length;

  return <div className="space-y-6 p-5 lg:p-6">
    <PageHeader title="Follow-Ups" description="All employee follow-up commitments, completion status and delays inferred from subsequent visits."/>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardContent className="pt-5"><p className="text-sm text-slate-500">Pending</p><p className="mt-1 text-3xl font-bold">{pending}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-sm text-slate-500">Completed</p><p className="mt-1 text-3xl font-bold text-emerald-600">{completed}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-sm text-slate-500">Delayed</p><p className="mt-1 text-3xl font-bold text-rose-600">{delayed}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="size-5"/>Follow-Up Records</CardTitle>
      <div className="flex flex-wrap gap-2 pt-2">{(["all","pending","completed","delayed"] as const).map(v=><button key={v} className={`rounded-lg px-3 py-2 text-sm ${filter===v?"bg-slate-950 text-white":"border bg-white text-slate-600"}`} onClick={()=>setFilter(v)}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
    </CardHeader><CardContent>
      {loading?<div className="py-10 text-center text-sm text-slate-500">Loading follow-ups...</div>:filtered.length===0?<div className="py-10 text-center text-sm text-slate-500">No follow-up records found.</div>:
      <div className="overflow-x-auto"><table className="w-full min-w-[1200px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
        <th className="px-3 py-3">Employee</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Party</th><th className="px-3 py-3">Follow-Up Date</th><th className="px-3 py-3">Original Visit</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Completed Visit</th><th className="px-3 py-3">Delay</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Discussion</th><th className="px-3 py-3">Outcome</th>
      </tr></thead><tbody>{filtered.map(r=><tr className="border-b last:border-0 dark:border-slate-800" key={`${r.visit_type}-${r.id}`}>
        <td className="px-3 py-4 font-semibold">{r.employee_name}</td><td className="px-3 py-4">{r.visit_type}</td><td className="px-3 py-4 font-semibold">{r.party_name}</td><td className="px-3 py-4">{r.follow_up_date}</td><td className="px-3 py-4">{r.original_visit_date}</td>
        <td className="px-3 py-4">{r.completed?<Badge tone="success"><CheckCircle2 className="mr-1 size-3"/>Completed</Badge>:<Badge tone="warning"><Clock3 className="mr-1 size-3"/>Pending</Badge>}</td>
        <td className="px-3 py-4">{r.completed_visit_date??"—"}</td><td className={`px-3 py-4 font-semibold ${r.delay_days>0?"text-rose-600":"text-emerald-600"}`}>{r.completed?r.delay_days===0?"On time":`${r.delay_days} day(s) late`:"—"}</td><td className="px-3 py-4 text-slate-500">{r.location||"—"}</td><td className="max-w-[280px] px-3 py-4 text-slate-500">{r.discussion||"—"}</td><td className="max-w-[280px] px-3 py-4 text-slate-500">{r.outcome||"—"}</td>
      </tr>)}</tbody></table></div>}
    </CardContent></Card>
  </div>;
}
