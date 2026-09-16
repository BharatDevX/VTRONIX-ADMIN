import { FileDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { printTableReport } from "@/services/export.service";
import { getAdminFollowUps } from "@/features/followUps/service";
import { getActualSales } from "@/features/sales/actualSalesService";
import { getLiveTrackingReportRows } from "@/features/tracking/service";

type ReportDefinition = {
  key: string;
  label: string;
  table?: string;
  columns: Array<{ key: string; label: string }>;
  load?: () => Promise<Record<string, unknown>[]>;
  relations?: Array<{ field: string; table: "employees" | "doctors" | "dealers" | "products" | "retailers"; output: string }>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveReportNames(
  rows: Record<string, unknown>[],
  relations: ReportDefinition["relations"] = [],
) {
  const maps = new Map<string, Map<string, string>>();

  await Promise.all(
    relations.map(async ({ field, table, output }) => {
      const ids = [...new Set(
        rows
          .map((row) => row[field])
          .filter((value): value is string => typeof value === "string" && UUID_RE.test(value)),
      )];
      if (!ids.length) {
        maps.set(output, new Map());
        return;
      }

      const nameColumn =
        table === "employees" ? "full_name" :
        table === "doctors" ? "doctor_name" :
        table === "dealers" ? "dealer_name" :
        table === "products" ? "product_name" : "retailer_name";

      const { data, error } = await supabase.from(table).select(`id, ${nameColumn}`).in("id", ids);
      if (error) throw error;

      maps.set(output, new Map(
        (data ?? []).map((row) => [
          String(row.id),
          String((row as Record<string, unknown>)[nameColumn] ?? ""),
        ]),
      ));
    }),
  );

  return rows.map((row) => {
    const next = { ...row };
    for (const { field, output } of relations) {
      const id = typeof row[field] === "string" ? row[field] : "";
      const map = maps.get(output);
      if (id && map?.has(id)) {
        next[field] = map.get(id);
      } else if (id) {
        next[field] = `Unknown ${output}`;
      }
    }
    return next;
  });
}

export default function ReportsPage() {
  const [running,setRunning]=useState<string | null>(null); const [error,setError]=useState<string | null>(null);
  const [counts,setCounts]=useState<Record<string,number>>({});
  const definitions=useMemo<ReportDefinition[]>(()=>[
    {key:"attendance",label:"Attendance",table:"attendance",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"attendance_date",label:"Date"},{key:"status",label:"Status"},{key:"check_in_time",label:"Check In"},{key:"check_out_time",label:"Check Out"},{key:"working_minutes",label:"Working Minutes"}]},
    {key:"employees",label:"Employees",table:"employees",columns:[{key:"employee_id",label:"Employee ID"},{key:"full_name",label:"Name"},{key:"designation",label:"Designation"},{key:"head_quarters",label:"Head Quarters"},{key:"mobile",label:"Mobile"},{key:"is_active",label:"Active"}]},
    {key:"doctor-visits",label:"Doctor Visits",table:"doctor_visits",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"doctor_id",table:"doctors",output:"doctor"}],columns:[{key:"employee_id",label:"Employee"},{key:"doctor_id",label:"Doctor"},{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"}]},
    {key:"dealer-visits",label:"Dealer Visits",table:"dealer_visits",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"dealer_id",table:"dealers",output:"dealer"}],columns:[{key:"employee_id",label:"Employee"},{key:"dealer_id",label:"Dealer"},{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"}]},
    {key:"farmer-visits",label:"Farmer Visits",table:"farmer_visits",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"farmer_name",label:"Farmer"},{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"}]},
    {key:"doctor-plans",label:"Doctor Meeting Plans",table:"doctor_meeting_plans",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"doctor_id",table:"doctors",output:"doctor"}],columns:[{key:"employee_id",label:"Employee"},{key:"doctor_id",label:"Doctor"},{key:"planned_date",label:"Date"},{key:"location",label:"Location"},{key:"reply",label:"Reply"}]},
    {key:"dealer-plans",label:"Dealer Meeting Plans",table:"dealer_meeting_plans",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"dealer_id",table:"dealers",output:"dealer"}],columns:[{key:"employee_id",label:"Employee"},{key:"dealer_id",label:"Dealer"},{key:"planned_date",label:"Date"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"}]},
    {key:"farmer-plans",label:"Farmer Meeting Plans",table:"farmer_meeting_plans",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"farmer_name",label:"Farmer"},{key:"planned_date",label:"Date"},{key:"location",label:"Location"},{key:"note",label:"Note"}]},
    {key:"order-form",label:"Order Form / Sales",table:"sales",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"dealer_id",table:"dealers",output:"dealer"},{field:"doctor_id",table:"doctors",output:"doctor"},{field:"product_id",table:"products",output:"product"}],columns:[{key:"employee_id",label:"Employee"},{key:"sale_date",label:"Date"},{key:"sale_type",label:"Type"},{key:"dealer_id",label:"Dealer"},{key:"doctor_id",label:"Doctor"},{key:"product_id",label:"Product"},{key:"quantity",label:"Qty"},{key:"rate",label:"Rate"},{key:"amount",label:"Amount"}]},
    {key:"sales-invoice",label:"Sales Invoice",columns:[{key:"sale_date",label:"Date"},{key:"employee_name",label:"Employee"},{key:"dealer_name",label:"Dealer"},{key:"hq",label:"HQ"},{key:"invoice_no",label:"Invoice"},{key:"total_amount",label:"Amount"}],load:async()=>{const rows=await getActualSales();return rows as unknown as Record<string,unknown>[];}},
    {key:"follow-ups",label:"Follow-Ups",columns:[{key:"employee_name",label:"Employee"},{key:"visit_type",label:"Type"},{key:"party_name",label:"Party"},{key:"follow_up_date",label:"Follow-up"},{key:"original_visit_date",label:"Original Visit"},{key:"completed",label:"Completed"}],load:async()=>{const rows=await getAdminFollowUps();return rows as unknown as Record<string,unknown>[];}},
    {key:"mtp",label:"MTP",table:"monthly_tour_programmes",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"month",label:"Month"},{key:"year",label:"Year"},{key:"status",label:"Status"},{key:"planned_days",label:"Planned Days"},{key:"remarks",label:"Remarks"}]},
    {key:"hq",label:"HQ Receivables",table:"hq_receivables",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"hq",label:"HQ"},{key:"month",label:"Month"},{key:"year",label:"Year"},{key:"paid_amount",label:"Paid"},{key:"overdue_amount",label:"Overdue"}]},
    {key:"doctors",label:"Doctor Master",table:"doctors",columns:[{key:"doctor_name",label:"Doctor"},{key:"specialization",label:"Specialization"},{key:"city",label:"City"},{key:"mobile",label:"Mobile"},{key:"head_quarters",label:"Head Quarters"},{key:"is_active",label:"Active"}]},
    {key:"dealers",label:"Dealer Master",table:"dealers",columns:[{key:"dealer_name",label:"Dealer"},{key:"contact_person",label:"Contact"},{key:"city",label:"City"},{key:"mobile",label:"Mobile"},{key:"gst_number",label:"GST"},{key:"is_active",label:"Active"}]},
    {key:"retailers",label:"Retailer Master",table:"retailers",columns:[{key:"retailer_name",label:"Retailer"},{key:"city",label:"City"},{key:"mobile",label:"Mobile"},{key:"is_active",label:"Active"}]},
    {key:"products",label:"Product Master",table:"products",columns:[{key:"product_name",label:"Product"},{key:"category",label:"Category"},{key:"price",label:"Price"},{key:"is_active",label:"Active"}]},
    {key:"sales-targets",label:"Sales Targets",table:"sales_targets",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"employee_id",label:"Employee"},{key:"month",label:"Month"},{key:"year",label:"Year"},{key:"target_amount",label:"Target"}]},
    {key:"counter-sales",label:"Counter Sales",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"dealer_id",table:"dealers",output:"dealer"},{field:"product_id",table:"products",output:"product"}],columns:[{key:"employee_id",label:"Employee"},{key:"sale_date",label:"Date"},{key:"dealer_id",label:"Dealer"},{key:"product_id",label:"Product"},{key:"quantity",label:"Qty"},{key:"rate",label:"Rate"},{key:"amount",label:"Amount"}],load:async()=>{const {data,error}=await supabase.from("sales").select("*").eq("sale_type","counter");if(error)throw error;return (data??[]) as Record<string,unknown>[];}},
    {key:"secondary-sales",label:"Secondary Sales",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"dealer_id",table:"dealers",output:"dealer"},{field:"product_id",table:"products",output:"product"}],columns:[{key:"employee_id",label:"Employee"},{key:"sale_date",label:"Date"},{key:"dealer_id",label:"Dealer"},{key:"product_id",label:"Product"},{key:"quantity",label:"Qty"},{key:"amount",label:"Amount"}],load:async()=>{const {data,error}=await supabase.from("sales").select("*").neq("sale_type","doctor");if(error)throw error;return (data??[]) as Record<string,unknown>[];}},
    {key:"doctor-wise-sales",label:"Doctor-wise Sales",relations:[{field:"employee_id",table:"employees",output:"employee"},{field:"doctor_id",table:"doctors",output:"doctor"},{field:"dealer_id",table:"dealers",output:"dealer"},{field:"product_id",table:"products",output:"product"}],columns:[{key:"employee_id",label:"Employee"},{key:"sale_date",label:"Date"},{key:"doctor_id",label:"Doctor"},{key:"dealer_id",label:"Dealer"},{key:"product_id",label:"Product"},{key:"quantity",label:"Qty"},{key:"amount",label:"Amount"}],load:async()=>{const {data,error}=await supabase.from("sales").select("*").eq("sale_type","doctor");if(error)throw error;return (data??[]) as Record<string,unknown>[];}},
    {
      key:"live-tracking",
      label:"Live Tracking",
      columns:[
        {key:"employee_name",label:"Employee Name"},
        {key:"date",label:"Date"},
        {key:"first_location",label:"First Location"},
        {key:"middle_locations",label:"Middle Locations"},
        {key:"last_location",label:"Last Location"},
        {key:"total_km_today",label:"Total KM Today"},
        {key:"total_km_month",label:"Total KM Month"},
        {key:"vehicle_type",label:"Vehicle Type"},
      ],
      load:async()=>await getLiveTrackingReportRows(),
    },
    {key:"notifications",label:"Notifications",table:"notifications",columns:[{key:"title",label:"Title"},{key:"body",label:"Message"},{key:"severity",label:"Severity"},{key:"is_read",label:"Read"},{key:"created_at",label:"Created"}]},
    {key:"order-deliveries",label:"Order Delivery",table:"sales_deliveries",relations:[{field:"employee_id",table:"employees",output:"employee"}],columns:[{key:"sale_id",label:"Order"},{key:"employee_id",label:"Employee"},{key:"delivery_date",label:"Delivery Date"},{key:"expected_delivery_date",label:"Expected"},{key:"delivered_amount",label:"Delivered"},{key:"status",label:"Status"}]},
  ],[]);
  const run=async(def:ReportDefinition)=>{setRunning(def.key);setError(null);try{let rows=def.load?await def.load():[];if(def.table){const result=await supabase.from(def.table).select("*");if(result.error)throw result.error;rows=(result.data??[]) as Record<string,unknown>[];}if(def.key==="employees"){rows=rows.map((row)=>({...row,head_quarters:Array.isArray(row.head_quarters)?row.head_quarters.join(", "):row.head_quarters??row.branch??""}));}
        rows = await resolveReportNames(rows, def.relations);
        printTableReport(`${def.label} Report`,"VETRONIX ERP Admin Report",def.columns,rows);setCounts((current)=>({...current,[def.key]:rows.length}));}catch(e){setError(e instanceof Error?e.message:`Unable to generate ${def.label} report.`);}finally{setRunning(null);}};
  return <div className="space-y-5 p-5 lg:p-6"><PageHeader title="Reports" description="Every major Admin Panel dataset has a structured PDF report with the actual records and columns." />{error?<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>:null}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{definitions.map((def)=><Card key={def.key}><CardHeader><CardTitle className="text-base">{def.label}</CardTitle></CardHeader><CardContent className="flex items-center justify-between gap-3"><span className="text-sm text-slate-500">{counts[def.key]===undefined?"Generate a full report":`${counts[def.key]} records`}</span><Button variant="outline" disabled={running!==null} onClick={()=>void run(def)}>{running===def.key?<Loader2 className="size-4 animate-spin"/>:<FileDown className="size-4"/>}PDF</Button></CardContent></Card>)}</div></div>;
}
