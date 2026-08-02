interface FieldProps {
  children: React.ReactNode;
  error?: string;
  label: string;
}

export function Field({ children, error, label }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
