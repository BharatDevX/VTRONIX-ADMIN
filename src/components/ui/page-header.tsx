interface PageHeaderProps {
  actions?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}

export function PageHeader({ actions, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
