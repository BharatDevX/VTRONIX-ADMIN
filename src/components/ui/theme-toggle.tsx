import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className={cn(
        "size-10 cursor-pointer rounded-full bg-slate-900 p-0 transition-all duration-300 active:scale-95",
        className,
      )}
    >
      <span className="sr-only">Toggle theme</span>
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
        <motion.g animate={{ rotate: isDark ? -180 : 0 }} transition={{ ease: "easeInOut", duration: 0.45 }}>
          <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill="white" />
          <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill="black" />
        </motion.g>
        <motion.path animate={{ rotate: isDark ? 180 : 0 }} transition={{ ease: "easeInOut", duration: 0.45 }} d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z" fill="white" />
      </svg>
    </button>
  );
};

export default ThemeToggleButton;
