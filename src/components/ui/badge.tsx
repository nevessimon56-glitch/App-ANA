import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const variants = {
  default: "bg-teal-50 text-teal-800 border-teal-100",
  success: "bg-emerald-50 text-emerald-800 border-emerald-100",
  warning: "bg-amber-50 text-amber-800 border-amber-100",
  danger: "bg-red-50 text-red-700 border-red-100",
  muted: "bg-slate-50 text-slate-600 border-slate-100",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
