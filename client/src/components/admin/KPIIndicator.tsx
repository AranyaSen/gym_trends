export function KPIIndicator({
  label,
  value,
  // trend,
  variant = "primary",
}: {
  label?: string;
  value?: number;
  // trend?: string;
  variant?: "primary" | "warning" | "muted";
}) {
  const colors = {
    primary: "text-brand-accent",
    warning: "text-amber-400",
    muted: "text-brand-muted",
  };

  return (
    <div className="p-4 border-2 border-brand-accent/20 rounded-lg glass-card flex flex-col justify-between h-32 hover:border-brand-accent/20 transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
          {label}
        </p>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-colors" />
      </div>
      <div>
        <p className={`text-3xl font-black ${colors[variant]}`}>{value}</p>
        {/* Functionality in progress, more testing required */}
        {/* {trend && (
          <p className="text-[10px] font-medium text-slate-500 mt-1">{trend}</p>
        )} */}
      </div>
    </div>
  );
}
