import { Plus, Trash2, FileDown, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { getAllEmployees } from "@/features/adminEmployee/services/adminEmployee.service";
import { getDealers, getProducts } from "@/features/master/services/master.service";
import { createActualSale, getActualSaleDetails, getActualSales, type ActualSaleLineInput, type ActualSaleListRow } from "@/features/sales/actualSalesService";
import { printTableReport, renderSalesInvoicePdf } from "@/services/export.service";
import type { Employee } from "@/types/domain";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
type Line = ActualSaleLineInput;
const emptyLine = (): Line => ({ product_id: "", pack_size: "", box_count: 1, quantity: 1, rate: 0 });

export default function SalesInvoicePage() {
  const [employees,setEmployees]=useState<Employee[]>([]); const [dealers,setDealers]=useState<any[]>([]); const [products,setProducts]=useState<any[]>([]); const [rows,setRows]=useState<ActualSaleListRow[]>([]);
  const [employeeId,setEmployeeId]=useState(""); const [dealerId,setDealerId]=useState(""); const [hq,setHq]=useState(""); const [invoiceNo,setInvoiceNo]=useState(""); const [saleDate,setSaleDate]=useState(dayjs().format("YYYY-MM-DD")); const [creditPeriod,setCreditPeriod]=useState(""); const [dueDate,setDueDate]=useState(""); const [lines,setLines]=useState<Line[]>([emptyLine()]); const [saving,setSaving]=useState(false); const [loading,setLoading]=useState(true); const [pdfLoadingId,setPdfLoadingId]=useState<string | null>(null); const [feedback,setFeedback]=useState<string | null>(null);
  const selectedEmployee=employees.find((e)=>e.id===employeeId);
  const total=useMemo(()=>lines.reduce((sum,line)=>sum+Number(line.quantity||0)*Number(line.rate||0),0),[lines]);
  const load=async()=>{setLoading(true);try{const [e,d,p,s]=await Promise.all([getAllEmployees(),getDealers(),getProducts(),getActualSales()]);setEmployees(e);setDealers(d as any[]);setProducts(p as any[]);setRows(s);}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  useEffect(()=>{if(selectedEmployee){const first=(selectedEmployee.head_quarters?.[0]??selectedEmployee.branch??"").trim();setHq(first);}},[selectedEmployee]);
  const updateLine=(index:number,patch:Partial<Line>)=>setLines((current)=>current.map((line,i)=>i===index?{...line,...patch}:line));
  const generateIndividualPdf=async(row:ActualSaleListRow)=>{
    const popup=window.open("", "_blank", "width=1000,height=800");
    if(!popup){setFeedback("Please allow pop-ups in your browser to generate the PDF.");return;}
    setPdfLoadingId(row.id);
    try{
      popup.document.write("<p style=\"font-family:Arial;padding:24px\">Preparing sales invoice PDF...</p>");
      const details=await getActualSaleDetails(row.id);
      renderSalesInvoicePdf(popup,details);
    }catch(error){
      popup.close();
      setFeedback(error instanceof Error?error.message:"Unable to generate sales invoice PDF.");
    }finally{setPdfLoadingId(null);}
  };
  const save=async()=>{setFeedback(null);if(!employeeId||!dealerId||!hq.trim())return setFeedback("Employee, dealer and Head Quarter are required.");if(lines.some((l)=>!l.product_id||!l.pack_size.trim()||l.box_count<=0||l.quantity<=0||l.rate<=0))return setFeedback("Complete every medicine line with pack size, box, quantity and rate.");setSaving(true);try{await createActualSale({employee_id:employeeId,dealer_id:dealerId,sale_date:saleDate,hq:hq.trim(),invoice_no:invoiceNo,credit_period:creditPeriod?Number(creditPeriod):null,due_date:dueDate||null,lines});setFeedback("Sales Invoice saved successfully.");setInvoiceNo("");setLines([emptyLine()]);await load();}catch(e){setFeedback(e instanceof Error?e.message:"Unable to save sales invoice.");}finally{setSaving(false);}};
  return <div className="space-y-5 p-5 lg:p-6">
    <PageHeader title="Sales Invoice" description="Admin-only sales invoice entry. Employees can only view the resulting sales in the employee app." actions={<Button variant="outline" onClick={()=>void load()}><RefreshCw className="size-4"/>Refresh</Button>}/>
    {feedback?<div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">{feedback}</div>:null}
    <Card><CardHeader><CardTitle>New Sales Invoice</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Employee"><select className={input} value={employeeId} onChange={e=>setEmployeeId(e.target.value)}><option value="">Select employee</option>{employees.map(e=><option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}</select></Field>
        <Field label="Dealer"><select className={input} value={dealerId} onChange={e=>setDealerId(e.target.value)}><option value="">Select dealer</option>{dealers.map(d=><option key={d.id} value={d.id}>{d.dealer_name}</option>)}</select></Field>
        <Field label="Head Quarter"><select className={input} value={hq} onChange={e=>setHq(e.target.value)}><option value="">Select Head Quarter</option>{(selectedEmployee?.head_quarters??[]).map((value)=><option key={value} value={value}>{value}</option>)}{hq && !(selectedEmployee?.head_quarters??[]).includes(hq)?<option value={hq}>{hq}</option>:null}</select></Field>
        <Field label="Invoice Number"><input className={input} value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} /></Field>
        <Field label="Sale Date"><input className={input} type="date" value={saleDate} onChange={e=>setSaleDate(e.target.value)} /></Field>
        <Field label="Credit Period (days)"><input className={input} type="number" min="0" value={creditPeriod} onChange={e=>setCreditPeriod(e.target.value)} /></Field>
        <Field label="Due Date"><input className={input} type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} /></Field>
      </div>
      <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-semibold">Medicines</h3><Button type="button" variant="outline" onClick={()=>setLines((l)=>[...l,emptyLine()])}><Plus className="size-4"/>Add Medicine</Button></div>
        {lines.map((line,index)=><div className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-6 dark:border-slate-800" key={index}><select className={input} value={line.product_id} onChange={e=>updateLine(index,{product_id:e.target.value})}><option value="">Product</option>{products.map(p=><option key={p.id} value={p.id}>{p.product_name}</option>)}</select><input className={input} placeholder="Box Size / Pack Size" aria-label="Box Size / Pack Size" value={line.pack_size} onChange={e=>updateLine(index,{pack_size:e.target.value})}/><input className={input} type="number" min="1" placeholder="Box Qty" aria-label="Box quantity" value={line.box_count} onChange={e=>updateLine(index,{box_count:Number(e.target.value)})}/><input className={input} type="number" min="1" placeholder="Quantity (Units)" aria-label="Quantity in units" value={line.quantity} onChange={e=>updateLine(index,{quantity:Number(e.target.value)})}/><input className={input} type="number" min="0" step="0.01" placeholder="Rate (₹)" aria-label="Rate in rupees" value={line.rate} onChange={e=>updateLine(index,{rate:Number(e.target.value)})}/><div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 text-sm font-semibold dark:bg-slate-900">₹{(line.quantity*line.rate).toFixed(2)}<Button type="button" size="icon" variant="ghost" onClick={()=>setLines((l)=>l.length===1?l:l.filter((_,i)=>i!==index))}><Trash2 className="size-4"/></Button></div></div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950 px-5 py-4 text-white"><span className="text-sm font-semibold">Invoice Total</span><span className="text-2xl font-bold">₹{total.toFixed(2)}</span></div>
      <Button disabled={saving} onClick={()=>void save()}>{saving?"Saving...":"Save Sales Invoice"}</Button>
    </CardContent></Card>
    <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>Recent Sales Invoices</CardTitle><Button variant="outline" onClick={()=>printTableReport("Sales Invoice Report","All recorded admin sales invoices",[{key:"sale_date",label:"Date"},{key:"employee_name",label:"Employee"},{key:"dealer_name",label:"Dealer"},{key:"hq",label:"Head Quarter"},{key:"invoice_no",label:"Invoice"},{key:"total_amount",label:"Amount"}],rows)}><FileDown className="size-4"/>PDF</Button></div></CardHeader><CardContent>{loading?<div className="py-10 text-center text-sm text-slate-500">Loading...</div>:rows.length===0?<div className="py-10 text-center text-sm text-slate-500">No sales invoices yet.</div>:<div className="overflow-x-auto"><table className="w-full min-w-[800px] text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Employee</th><th className="px-3 py-3">Dealer</th><th className="px-3 py-3">HQ</th><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">PDF</th></tr></thead><tbody>{rows.map(row=><tr className="border-b last:border-0" key={row.id}><td className="px-3 py-3">{row.sale_date}</td><td className="px-3 py-3">{row.employee_name}</td><td className="px-3 py-3">{row.dealer_name}</td><td className="px-3 py-3">{row.hq}</td><td className="px-3 py-3">{row.invoice_no}</td><td className="px-3 py-3 font-semibold">₹{row.total_amount.toFixed(2)}</td><td className="px-3 py-3"><Button size="sm" variant="outline" disabled={pdfLoadingId===row.id} onClick={()=>void generateIndividualPdf(row)}><FileDown className="size-4"/>{pdfLoadingId===row.id?"Preparing...":"Generate PDF"}</Button></td></tr>)}</tbody></table></div>}</CardContent></Card>
  </div>;
}
