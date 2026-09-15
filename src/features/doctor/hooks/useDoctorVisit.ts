import { useEffect } from "react";

import {

getDoctorVisits,

saveDoctorVisit

} from "../services/doctorVisit.service";

import {

DoctorVisitForm

} from "../types/doctoVisit.types";

import {

useDoctorVisitStore

} from "../store/doctorVisit.store";

export function useDoctorVisit(employeeId:string){

const{

visits,

loading,

saving,

setVisits,

upsertVisit,

setLoading,

setSaving

}=useDoctorVisitStore();

async function loadVisits(){

setLoading(true);

try{

const data=

await getDoctorVisits(employeeId);

setVisits(data ?? []);

}

finally{

setLoading(false);

}

}

async function save(

form:DoctorVisitForm

){

setSaving(true);

try{

const result=await saveDoctorVisit(

employeeId,

form

);

upsertVisit(result.data);

return result;

}

finally{

setSaving(false);

}

}

useEffect(()=>{

if(employeeId){

loadVisits();

}

},[employeeId]);

return{

visits,

loading,

saving,

save,

reload:loadVisits

};

}