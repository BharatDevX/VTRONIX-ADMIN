import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DrawerProps {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  widthClassName?: string;
}

export function Drawer({ children, onClose, open, title, widthClassName }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <button aria-label="Close drawer backdrop" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <aside className={cn("relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl", widthClassName)}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <Button aria-label="Close drawer" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}
