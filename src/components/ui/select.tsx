import React from "react";
import { inputClassName } from "@/lib/form-style";

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
};

export function Select({ value, onValueChange, children, className }: SelectProps) {
  const items = React.Children.toArray(children).filter((child: any) => child?.type === SelectItem) as any[];

  return (
    <div className={className}>
      <select
        className={inputClassName()}
        value={value ?? ""}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
      >
        <option value="">Select</option>
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value}>
            {item.props.children}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SelectTrigger({ children }: { children?: React.ReactNode }) {
  // No-op wrapper for compatibility
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  // No-op placeholder used inside trigger
  return <>{placeholder ?? null}</>;
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
  // No-op wrapper for compatibility
  return <>{children}</>;
}

export function SelectItem({  }: { value: string; children?: React.ReactNode }) {
  // Render nothing -- items are consumed by Select
  return null;
}

export default Select;
