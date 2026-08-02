import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-3",
        icon: "size-9 px-0",
        lg: "h-10 px-4",
        sm: "h-8 px-2.5 text-xs",
      },
      variant: {
        default: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
        outline: "border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      },
    },
  },
);

export function Button({
  className,
  size,
  variant,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}
