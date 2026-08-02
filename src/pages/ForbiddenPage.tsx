import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const { session, signOut } = useAuth();

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6 dark:bg-slate-950">
      <section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Access restricted</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your current role does not have permission to open this admin surface.</p>
        <Button className="mt-5" onClick={() => void signOut()}>
          Sign out
        </Button>
      </section>
    </main>
  );
}
