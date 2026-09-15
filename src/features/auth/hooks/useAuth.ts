import { useState } from "react";
import { Alert } from "react-native";

import { login } from "../services/auth.service";
import { getEmployee } from "../services/employee.service";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const setEmployee = useAuthStore((state) => state.setEmployee);

  async function signIn(
    employeeId: string,
    password: string
  ) {
    try {
      setLoading(true);

      const auth = await login(employeeId, password);

      if (!auth.user) {
        throw new Error("Login failed");
      }

      const employee = await getEmployee(auth.user.id);

      setEmployee(employee);

      return true;
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message ?? "Something went wrong"
      );

      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    signIn,
    loading,
  };
}