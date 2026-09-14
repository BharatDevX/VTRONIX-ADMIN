import {create} from "zustand";

import {IncentiveDashboard}

from "../types/incentive.types";

interface State{

dashboard:IncentiveDashboard|null;

loading:boolean;

setDashboard:(d:IncentiveDashboard)=>void;

setLoading:(b:boolean)=>void;

}

export const useIncentiveStore=create<State>((set)=>({

dashboard:null,

loading:false,

setDashboard:(dashboard)=>set({dashboard}),

setLoading:(loading)=>set({loading})

}));