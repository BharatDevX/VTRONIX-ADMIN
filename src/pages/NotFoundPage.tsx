import { PageHeader } from "@/components/ui/page-header";

export default function NotFoundPage() {
  return (
    <div>
      <PageHeader description="The requested admin surface does not exist." eyebrow="404" title="Page not found" />
      <div className="p-5 dark:bg-slate-950">
        <a className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600" href="/">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
