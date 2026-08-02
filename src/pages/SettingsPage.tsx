import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { useOrganizationSettings, useSaveOrganizationSettings } from "@/features/settings/hooks";
import { inputClassName } from "@/lib/form-style";

interface SettingsForm {
  address: string;
  branches: string;
  designations: string;
  name: string;
}

export default function SettingsPage() {
  const settings = useOrganizationSettings();
  const save = useSaveOrganizationSettings();
  const form = useForm<SettingsForm>({
    defaultValues: { address: "", branches: "", designations: "", name: "Vetronix" },
  });

  useEffect(() => {
    if (settings.data) {
      form.reset({
        address: settings.data.address ?? "",
        branches: settings.data.branches.join(", "),
        designations: settings.data.designations.join(", "),
        name: settings.data.name,
      });
    }
  }, [form, settings.data]);

  return (
    <div>
      <PageHeader description="Organization profile, branches, designations, role surfaces, password and permission administration." eyebrow="Control center" title="Settings" />
      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Organization</h2>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
             onSubmit={form.handleSubmit(async (values) => {
  try {
    await save.mutateAsync({
      address: values.address,
      branches: values.branches
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      designations: values.designations
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      id: settings.data?.id,
      name: values.name,
    });

    alert("Settings saved successfully.");
  } catch (e) {
    console.error(e);
    alert("Unable to save settings.");
  }
})}
            >
              <Field label="Organization name">
                <input className={inputClassName()} {...form.register("name")} />
              </Field>
              <Field label="Address">
                <textarea className={`${inputClassName("h-24 py-2")} resize-none`} {...form.register("address")} />
              </Field>
              <Field label="Branches">
                <input className={inputClassName()} placeholder="Mumbai, Pune, Delhi" {...form.register("branches")} />
              </Field>
              <Field label="Designations">
                <input className={inputClassName()} placeholder="MR, Area Manager, Regional Manager" {...form.register("designations")} />
              </Field>
              <Button disabled={save.isPending} type="submit">
                <Save />
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">Roles and permissions</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Admin: full organization control, employee access, approvals, reports, settings.</p>
            <p>Manager: team operations, attendance, visits, sales, MTP actions.</p>
            <p>Viewer: read-only dashboards, reports, and operational history.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
