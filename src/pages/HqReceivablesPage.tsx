import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, IndianRupee, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { getHqNames, getHqReceivables, saveHqReceivable, type HqReceivableRecord } from "@/features/hqReceivables/service";

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

function money(value: number) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
}

export default function HqReceivablesPage() {
  const today = new Date();
  const [month,setMonth]=useState(today.getMonth()+1);
  const [year,setYear]=useState(today.getFullYear());
  const [hq,setHq]=useState("");
  const [paid,setPaid]=useState("");
  const [overdue,setOverdue]=useState("");
  const [hqNames,setHqNames]=useState<string[]>([]);
  const [records,setRecords]=useState<HqReceivableRecord[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [feedback,setFeedback]=useState<{type:"success"|"error";message:string}|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try {
      const [rows,names]=await Promise.all([getHqReceivables(month,year),getHqNames()]);
      setRecords(rows); setHqNames(names);
    } catch(e) {
      setFeedback({type:"error",message:e instanceof Error?e.message:"Unable to load HQ receivables."});
    } finally {setLoading(false);}
  },[month,year]);
  useEffect(()=>{void load();},[load]);

  const selected=useMemo(()=>records.find(r=>r.hq===hq),[records,hq]);
  useEffect(()=>{
    if(selected){setPaid(String(selected.paid_amount));setOverdue(String(selected.overdue_amount));}
    else if(hq){setPaid("");setOverdue("");}
  },[hq,selected]);

  const save=async()=>{
    const paidAmount=Number(paid), overdueAmount=Number(overdue);
    if(!hq.trim()) return setFeedback({type:"error",message:"Please select or enter a Head Quarter."});
    if(!Number.isFinite(paidAmount)||paidAmount<0||!Number.isFinite(overdueAmount)||overdueAmount<0) return setFeedback({type:"error",message:"Please enter valid amounts."});
    setSaving(true); setFeedback(null);
    try{await saveHqReceivable(hq,month,year,paidAmount,overdueAmount);await load();setFeedback({type:"success",message:"HQ paid / overdue amounts saved successfully."});}
    catch(e){setFeedback({type:"error",message:e instanceof Error?e.message:"Unable to save HQ receivables."});}
    finally{setSaving(false);}
  };

  const years=Array.from({length:5},(_,i)=>today.getFullYear()-1+i);

  return <div className="space-y-6 p-5 lg:p-6">
    <PageHeader title="HQ Receivables" description="Client-maintained Head Quarter-wise paid and overdue amounts shown on employee dashboards." actions={<Button disabled={loading} onClick={()=>void load()} variant="outline"><RefreshCw className="size-4"/>Refresh</Button>}/>
    {feedback?<div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type==="success"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</div>:null}
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card><CardHeader><CardTitle>Update HQ Amounts</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Field label="Month"><select className={inputClassName} value={month} onChange={e=>setMonth(Number(e.target.value))}>{monthNames.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></Field>
          <Field label="Year"><select className={inputClassName} value={year} onChange={e=>setYear(Number(e.target.value))}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></Field>
        </div>
        <Field label="Head Quarter">
          <select className={inputClassName} value={hq} onChange={e=>setHq(e.target.value)}>
            <option value="">Select HQ</option>{hqNames.map(name=><option key={name} value={name}>{name}</option>)}
          </select>
          <input className={`${inputClassName} mt-2`} placeholder="Or type HQ manually" value={hq} onChange={e=>setHq(e.target.value)}/>
        </Field>
        <Field label="Total Paid Amount (₹)"><div className="relative"><IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><input className={`${inputClassName} pl-9`} type="number" min="0" value={paid} onChange={e=>setPaid(e.target.value)}/></div></Field>
        <Field label="Total Overdue Amount (₹)"><div className="relative"><IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><input className={`${inputClassName} pl-9`} type="number" min="0" value={overdue} onChange={e=>setOverdue(e.target.value)}/></div></Field>
        <Button className="w-full" disabled={saving} onClick={()=>void save()}><Check className="size-4"/>{saving?"Saving...":selected?"Update Amounts":"Save Amounts"}</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>{monthNames[month-1]} {year} — HQ Receivables</CardTitle></CardHeader><CardContent>
        {loading?<div className="py-12 text-center text-sm text-slate-500">Loading...</div>:records.length===0?<div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">No HQ amounts entered for this month.</div>:
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3">HQ</th><th className="px-3 py-3 text-right">Paid</th><th className="px-3 py-3 text-right">Overdue</th><th className="px-3 py-3 text-right">Action</th></tr></thead><tbody>
          {records.map(r=><tr className="border-b last:border-0 dark:border-slate-800" key={r.id}><td className="px-3 py-4 font-semibold">{r.hq}</td><td className="px-3 py-4 text-right font-semibold text-emerald-700">{money(Number(r.paid_amount))}</td><td className="px-3 py-4 text-right font-semibold text-red-700">{money(Number(r.overdue_amount))}</td><td className="px-3 py-4 text-right"><Button size="sm" variant="outline" onClick={()=>{setHq(r.hq);setPaid(String(r.paid_amount));setOverdue(String(r.overdue_amount));}}>Edit</Button></td></tr>)}
        </tbody></table></div>}
      </CardContent></Card>
    </div>
  </div>;
}
