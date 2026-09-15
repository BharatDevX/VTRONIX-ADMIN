import { useEffect } from "react";

import {
createPlan,
getPlans
} from "../services/doctorPlan.service";

import {
DoctorMeetingPlanForm
} from "../types/doctorPlan.types";

import {
useDoctorPlanStore
} from "../store/doctorPlan.store";

export function useDoctorPlan(employeeId:string){

const{

plans,

loading,

saving,

setPlans,

upsertPlan,

setLoading,

setSaving

}=useDoctorPlanStore();

async function loadPlans(){

setLoading(true);

try{

const data=await getPlans(employeeId);

setPlans(data??[]);

}

finally{

setLoading(false);

}

}

async function savePlan(

form:DoctorMeetingPlanForm

){

setSaving(true);

try{

const result=await createPlan(employeeId,form);

upsertPlan(result.data);

return result;

}

finally{

setSaving(false);

}

}

useEffect(()=>{

if(employeeId){

loadPlans();

}

},[employeeId]);

return{

plans,

loading,

saving,

savePlan,

reload:loadPlans

};

}