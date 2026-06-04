import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-3 relative">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={clsx(
            "flex h-11 w-full rounded-lg border border-brand-border/50 bg-brand-surface/50 px-3 py-2 text-sm text-white ring-offset-brand-bg transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:border-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500/30",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs absolute bottom-[-20px] font-medium text-red-500 ml-1">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
