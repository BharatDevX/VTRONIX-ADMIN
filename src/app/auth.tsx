/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/services/supabase";
import type { Role } from "@/types/domain";
import { fallbackPermissionsForAdmin, type AdminPermissionState } from "@/config/adminPermissions";

interface AuthProfile {
  id: string;
  employee_id: string;
  auth_id: string | null;
  full_name: string;
  branch: string | null;
  role: Role;
}

interface AuthContextValue {
  isLoading: boolean;
  profile: AuthProfile | null;
  adminPermissions: AdminPermissionState | null;
  role: Role | null;
  session: Session | null;
  signIn: (employeeId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(user: User | null): Promise<AuthProfile | null> {
  if (!user) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("id, employee_id, auth_id, full_name, branch, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    employee_id: data.employee_id,
    auth_id: data.auth_id,
    full_name: data.full_name,
    branch: data.branch,
    role: data.role,
  };
}

async function loadAdminPermissions(profile: AuthProfile): Promise<AdminPermissionState> {
  // These five named management accounts are the initial Vetronix Admin accounts.
  // Keep their access deterministic even if the permissions table is temporarily
  // unavailable or an RLS policy prevents the client from reading it.
  const normalizedName = profile.full_name.trim().toLowerCase().replace(/\s+/g, " ");

  if (normalizedName.includes("naseeba jabeen")) {
    return fallbackPermissionsForAdmin(profile.full_name);
  }

  const isFullManagementAdmin =
    normalizedName.includes("s.m. arif") ||
    normalizedName.includes("s.m.arif") ||
    normalizedName.includes("syed mohammad tayyab") ||
    normalizedName.includes("dr. varun shukla") ||
    normalizedName.includes("hina ali");

  if (isFullManagementAdmin) {
    return { mode: "full", allowedRoutes: [] };
  }

  const fallback = fallbackPermissionsForAdmin(profile.full_name);

  const { data, error } = await supabase
    .from("admin_permissions")
    .select("access_level, allowed_routes")
    .eq("employee_id", profile.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("Admin permissions lookup failed; using compatibility fallback.", error);
    return fallback;
  }

  return {
    mode: data.access_level === "restricted" ? "restricted" : "full",
    allowedRoutes: Array.isArray(data.allowed_routes) ? data.allowed_routes : [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissionState | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const profileLoadVersion = useRef(0);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const requestVersion = ++profileLoadVersion.current;
      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setAdminPermissions(null);
        setIsLoading(false);
        return;
      }

      if (event === "TOKEN_REFRESHED") return;

      setIsLoading(true);
      queueMicrotask(() => {
        void (async () => {
          try {
            const nextProfile = await loadProfile(nextSession.user);
            if (!mounted || requestVersion !== profileLoadVersion.current) return;

            if (!nextProfile) {
              setProfile(null);
              setAdminPermissions(null);
              return;
            }

            const permissions = nextProfile.role === "admin"
              ? await loadAdminPermissions(nextProfile)
              : null;
            if (!mounted || requestVersion !== profileLoadVersion.current) return;

            setProfile(nextProfile);
            setAdminPermissions(permissions);
          } catch (err) {
            if (!mounted || requestVersion !== profileLoadVersion.current) return;
            console.error(err);
            setProfile(null);
            setAdminPermissions(null);
          } finally {
            if (mounted && requestVersion === profileLoadVersion.current) {
              setIsLoading(false);
            }
          }
        })();
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      profile,
      adminPermissions,
      role: profile?.role ?? null,
      session,
      signIn: async (employeeId, password) => {
        const normalizedEmployeeId = employeeId.trim();
        if (!normalizedEmployeeId) throw new Error("Employee ID is required.");

        // Employee ID is the login identifier shown to the user. Supabase Auth
        // still uses the existing private auth_email/email behind the scenes,
        // so existing passwords and Auth accounts are preserved.
        const { data: employee, error: employeeError } = await supabase
          .from("employees")
          .select("id, employee_id, auth_id, full_name, email, auth_email, role")
          .ilike("employee_id", normalizedEmployeeId)
          .maybeSingle();

        if (employeeError) throw employeeError;
        if (!employee) throw new Error("Invalid Employee ID or password.");

        const authEmail = employee.auth_email ?? employee.email;
        if (!authEmail) {
          throw new Error("This employee does not have a login account configured.");
        }

        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (error) throw error;
  profileLoadVersion.current += 1;

        if (authData.user.id !== employee.auth_id) {
          await supabase.auth.signOut();
          throw new Error("Your authentication account is not correctly linked to your employee profile. Please contact the administrator.");
        }

        if (employee.role !== "admin") {
          await supabase.auth.signOut();
          throw new Error("You are not authorized to access Admin ERP.");
        }

        const signedInProfile: AuthProfile = {
          id: employee.id,
          employee_id: employee.employee_id,
          auth_id: employee.auth_id,
          full_name: employee.full_name,
          branch: null,
          role: employee.role,
        };

        const permissions = await loadAdminPermissions(signedInProfile);
        setSession(authData.session);
        setProfile(signedInProfile);
        setAdminPermissions(permissions);
        setIsLoading(false);
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      },
      user: session?.user ?? null,
    }),
    [isLoading, profile, adminPermissions, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
