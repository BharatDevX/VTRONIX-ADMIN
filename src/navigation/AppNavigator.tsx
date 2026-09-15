import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./../features/auth/screens/SplashScreen";
import LoginScreen from "./../features/auth/screens/LoginScreen";
import HomeScreen from "../features/home/screens/HomeScreen";
import AttendanceScreen from "../features/attendance/screens/AttendanceScreen";
import AttendanceHistoryScreen from "../features/attendance/screens/AttendanceHistoryScreen";
import DoctorMeetingPlanScreen from "../features/doctor/screens/DoctorMeetingPlanScreen";
import DoctorVisitScreen from "../features/doctor/screens/DoctorVisitScreen";
import DealerMeetingPlanScreen from "../features/dealer/screens/DealerMeetingPlanScreen";
import DealerVisitScreen from "../features/dealer/screens/DealerVisitScreen";
import SalesEntryScreen from "../features/sales/screens/SalesEntryScreen";
import CounterSaleReportScreen from "../features/sales/screens/CounterSaleReportScreen";
import DoctorWiseSalesReportScreen from "../features/sales/screens/DoctorWiseSalesReportScreen";
import SecondarySalesReportScreen from "../features/sales/screens/SecondarySalesReportScreen";
import IncentiveDashboardScreen from "../features/sales/screens/IncentiveDashboardScreen";
import EndWorkScreen from "@/features/work/screens/EndWorkScreen";
import EmployeeProfileScreen from "../features/profile/screens/EmployeeProfileScreen";
import DailyProgressScreen from "../features/daily-progress/screens/DailyProgressScreen";
import MonthlyTourProgrammeScreen from "../features/monthlyTourProgramme/screens/MonthlyTourProgrammeScreen"
import OrderDeliveryStatusScreen from "../features/orderDelivery/screens/OrderDeliveryStatusScreen";
import VisitSelectionScreen from "../features/home/screens/VisitSelectionScreen";
import MeetingPlanSelectionScreen from "../features/home/screens/MeetingPlanSelectionScreen";
import MonthlyMeetingPlanHistoryScreen from "../features/home/screens/MonthlyMeetingPlanHistoryScreen";
import FarmerMeetingPlanScreen from "../features/farmer/screens/FarmerMeetingPlanScreen";
import FarmerVisitScreen from "../features/farmer/screens/FarmerVisitScreen";
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
    Visit: undefined;
  MeetingPlan: undefined;
  Attendance: undefined;
  DoctorMeetingPlan: undefined;
  DoctorVisit: undefined;
  DealerMeetingPlan: undefined;
  FarmerMeetingPlan: undefined;
  FarmerVisit: undefined;
  MonthlyMeetingPlanHistory: undefined;
  DealerVisit: undefined;
EmployeeProfile: undefined;
SalesEntry: undefined;
CounterSaleReport: undefined;
DoctorWiseSalesReport: undefined;
SecondarySalesReport: undefined;
IncentiveDashboard: undefined;
AttendanceHistory: undefined;
EndWork: undefined;
DailyProgress: undefined;
MonthlyTourProgramme: undefined;
OrderDeliveryStatus: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
  name="EmployeeProfile"
  component={EmployeeProfileScreen}
/>
        <Stack.Screen
          name="Visit"
          component={VisitSelectionScreen}
        />
        <Stack.Screen
          name="MeetingPlan"
          component={MeetingPlanSelectionScreen}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
        />
        <Stack.Screen
          name="MonthlyTourProgramme"
          component={MonthlyTourProgrammeScreen}
        />
        <Stack.Screen
          name="AttendanceHistory"
          component={AttendanceHistoryScreen}
        />
        <Stack.Screen
          name="DoctorMeetingPlan"
          component={DoctorMeetingPlanScreen}
        />
        <Stack.Screen
          name="DoctorVisit"
          component={DoctorVisitScreen}
        />
        <Stack.Screen
  name="DealerMeetingPlan"
  component={DealerMeetingPlanScreen}
/>
<Stack.Screen
  name="FarmerMeetingPlan"
  component={FarmerMeetingPlanScreen}
/>
<Stack.Screen
  name="MonthlyMeetingPlanHistory"
  component={MonthlyMeetingPlanHistoryScreen}
/>
<Stack.Screen
    name="DealerVisit"
    component={DealerVisitScreen}
/>
<Stack.Screen
    name="FarmerVisit"
    component={FarmerVisitScreen}
/>

<Stack.Screen
    name="SalesEntry"
    component={SalesEntryScreen}
/>
<Stack.Screen

    name="CounterSaleReport"

    component={CounterSaleReportScreen}

/>
<Stack.Screen

name="DoctorWiseSalesReport"

component={DoctorWiseSalesReportScreen}

/>
<Stack.Screen

name="SecondarySalesReport"

component={SecondarySalesReportScreen}

/>
<Stack.Screen

name="IncentiveDashboard"

component={IncentiveDashboardScreen}

/>


<Stack.Screen
    name="EndWork"
    component={EndWorkScreen}
/>
<Stack.Screen
    name="DailyProgress"
    component={DailyProgressScreen}
/>
<Stack.Screen
    name="OrderDeliveryStatus"
    component={OrderDeliveryStatusScreen}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
