import { SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={clsx(
              "flex h-11 w-full appearance-none rounded-lg border border-brand-border/50 bg-brand-surface/50 px-3 py-2 text-sm text-white ring-offset-brand-bg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:border-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-visible:ring-red-500/30",
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1">{error}</p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
