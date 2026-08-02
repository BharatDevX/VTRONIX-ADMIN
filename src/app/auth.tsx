/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/services/supabase";
import type { Role } from "@/types/domain";

interface AuthProfile {
  branch: string | null;
  full_name: string;
  role: Role;
}

interface AuthContextValue {
  isLoading: boolean;
  profile: AuthProfile | null;
  role: Role | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(user: User | null): Promise<AuthProfile | null> {
  if (!user) return null;

  console.log("AUTH USER ID:", user.id);

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  console.log("EMPLOYEE DATA:", data);
  console.log("EMPLOYEE ERROR:", error);

  if (error || !data) {
    throw new Error("Employee profile not found");
  }

  return {
    full_name: data.full_name,
    branch: data.branch,
    role: data.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
  let mounted = true;

  async function initialize() {
    try {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);

      if (data.session?.user) {
        const profile = await loadProfile(data.session.user);
        if (mounted) setProfile(profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  }

  void initialize();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
    setSession(nextSession);

    try {
      if (nextSession?.user) {
        const profile = await loadProfile(nextSession.user);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
      setProfile(null);
    }
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
      role: profile?.role ?? null,
      session,
      signIn: async (email, password) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) throw error;

  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_id", data.user.id)
    .single();

  if (!employee) {
    await supabase.auth.signOut();
    throw new Error("Employee profile not found.");
  }

  if (employee.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("You are not authorized to access Admin ERP.");
  }
},
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      },
      user: session?.user ?? null,
    }),
    [isLoading, profile, session],
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
