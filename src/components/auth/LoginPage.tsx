import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { inputClassName } from "@/lib/form-style";

const loginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(6, "Password must contain at least 6 characters."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  if (session) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex min-h-[44vh] flex-col justify-between bg-slate-950 p-8 text-white lg:min-h-screen lg:p-12">
        <div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-950">
            <span className="text-base font-black">V</span>
          </div>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-normal lg:text-6xl">Vetronix Admin ERP</h1>
          <p className="mt-4 max-w-xl text-base text-slate-300">
            Enterprise command center for field teams, medical representatives, visits, sales, attendance, and live operations.
          </p>
        </div>
        <p className="text-sm text-slate-400">Secure Supabase authentication with persisted sessions and role-aware access.</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          onSubmit={form.handleSubmit(async (values) => {
            setError(null);
            try {
              await signIn(values.email, values.password);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Unable to sign in.");
            }
          })}
        >
          <h2 className="text-xl font-semibold text-slate-950">Admin sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your organization admin account.</p>

          <div className="mt-6 grid gap-4">
            <Field error={form.formState.errors.email?.message} label="Email">
              <input className={inputClassName()} placeholder="admin@vetronix.in" {...form.register("email")} />
            </Field>
            <Field error={form.formState.errors.password?.message} label="Password">
              <input className={inputClassName()} placeholder="••••••••" type="password" {...form.register("password")} />
            </Field>
          </div>

          {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p> : null}

          <Button className="mt-6 w-full" disabled={form.formState.isSubmitting} size="lg" type="submit">
            <LogIn />
            Sign in
          </Button>
        </form>
      </section>
    </main>
  );
}
