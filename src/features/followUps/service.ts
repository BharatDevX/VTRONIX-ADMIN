import { getDealersByIds, getDoctorsByIds, getEmployeesByIds } from "@/features/shared/real-db";
import { supabase } from "@/services/supabase";

export interface AdminFollowUpRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  visit_type: "Doctor" | "Dealer" | "Farmer";
  party_name: string;
  follow_up_date: string;
  original_visit_date: string;
  completed: boolean;
  completed_visit_date: string | null;
  delay_days: number;
  location: string;
  discussion: string;
  outcome: string;
}

function delayDays(from: string, to: string) {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export async function getAdminFollowUps() {
  const [{data:doctors,error:de},{data:dealers,error:dle},{data:farmers,error:fe}] = await Promise.all([
    supabase.from("doctor_visits").select("id, employee_id, doctor_id, visit_date, location, discussion, outcome, next_followup_date"),
    supabase.from("dealer_visits").select("id, employee_id, dealer_id, visit_date, location, discussion, outcome, next_followup_date"),
    supabase.from("farmer_visits").select("id, employee_id, farmer_name, visit_date, location, discussion, outcome, next_followup_date"),
  ]);
  if(de)throw de;if(dle)throw dle;if(fe)throw fe;

  const doctorAllRows:any[]=doctors??[],dealerAllRows:any[]=dealers??[],farmerAllRows:any[]=farmers??[];
  const doctorRows=doctorAllRows.filter(r=>r.next_followup_date);
  const dealerRows=dealerAllRows.filter(r=>r.next_followup_date);
  const farmerRows=farmerAllRows.filter(r=>r.next_followup_date);
  const employees=await getEmployeesByIds([...doctorRows,...dealerRows,...farmerRows].map(r=>r.employee_id));
  const doctorsMap=await getDoctorsByIds(doctorRows.map(r=>r.doctor_id));
  const dealersMap=await getDealersByIds(dealerRows.map(r=>r.dealer_id));

  const all=[
    ...doctorAllRows.map(r=>({id:r.id,employee_id:r.employee_id,type:"Doctor" as const,partyId:r.doctor_id,visit_date:r.visit_date,partyName:doctorsMap.get(r.doctor_id)?.doctor_name??"Unknown Doctor"})),
    ...dealerAllRows.map(r=>({id:r.id,employee_id:r.employee_id,type:"Dealer" as const,partyId:r.dealer_id,visit_date:r.visit_date,partyName:dealersMap.get(r.dealer_id)?.dealer_name??"Unknown Dealer"})),
    ...farmerAllRows.map(r=>({id:r.id,employee_id:r.employee_id,type:"Farmer" as const,partyId:r.farmer_name,visit_date:r.visit_date,partyName:r.farmer_name??"Unknown Farmer"})),
  ];

  const make=(r:any,type:"Doctor"|"Dealer"|"Farmer",partyId:any,partyName:string)=>{
    const completion=all
      .filter(v=>v.id!==r.id&&v.employee_id===r.employee_id&&v.type===type&&v.partyId===partyId&&v.visit_date>=r.next_followup_date&&v.visit_date>=r.visit_date)
      .sort((a,b)=>a.visit_date.localeCompare(b.visit_date))[0]??null;
    const today=new Date().toISOString().slice(0,10);
    const overduePending=!completion && today>r.next_followup_date;
    const emp=employees.get(r.employee_id);
    return {
      id:r.id,employee_id:r.employee_id,employee_name:emp?.full_name??"Unknown Employee",
      visit_type:type,party_name:partyName,follow_up_date:r.next_followup_date??"",
      original_visit_date:r.visit_date??"",completed:Boolean(completion),
      completed_visit_date:completion?.visit_date??null,
      delay_days:completion?delayDays(r.next_followup_date,completion.visit_date):overduePending?delayDays(r.next_followup_date,today):0,
      location:r.location??"",discussion:r.discussion??"",outcome:r.outcome??"",
    } satisfies AdminFollowUpRecord;
  };

  return [
    ...doctorRows.map(r=>make(r,"Doctor",r.doctor_id,doctorsMap.get(r.doctor_id)?.doctor_name??"Unknown Doctor")),
    ...dealerRows.map(r=>make(r,"Dealer",r.dealer_id,dealersMap.get(r.dealer_id)?.dealer_name??"Unknown Dealer")),
    ...farmerRows.map(r=>make(r,"Farmer",r.farmer_name,r.farmer_name??"Unknown Farmer")),
  ].sort((a,b)=>b.follow_up_date.localeCompare(a.follow_up_date));
}
