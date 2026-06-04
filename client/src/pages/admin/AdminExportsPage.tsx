import { useState, ReactNode } from "react";
import { downloadExport } from "../../services/admin/admin.services";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exportSchema, type ExportFormValues } from "../../schemas/gym";
import {
  Download,
  FileSpreadsheet,
  Database,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";

function AdminExportsPage() {
  const [err, setErr] = useState<string | null>(null);

  const { register, getValues } = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
    mode: "onChange",
    defaultValues: {
      from: "",
      to: "",
    },
  });

  const getParams = () => {
    const values = getValues();
    const p: Record<string, string> = {};
    if (values.from) p.from = new Date(values.from).toISOString();
    if (values.to) p.to = new Date(values.to).toISOString();
    return p;
  };

  const run = (path: string, name: string) => {
    setErr(null);
    downloadExport(path, name, getParams()).catch(() =>
      setErr("Export failed — check date range."),
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Data Exports</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Download your gym records in CSV format
          </p>
        </div>
      </header>

      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-brand-muted">
            Export Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="From Date" type="date" {...register("from")} />
            <Input label="To Date" type="date" {...register("to")} />
          </div>
          {err && (
            <p className="mt-4 text-xs font-bold text-red-400 uppercase tracking-wider text-center">
              {err}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ExportCard
          title="Members"
          description="Full list of registered members and details."
          icon={<Users className="w-6 h-6" />}
          onClick={() => run("/exports/members", "members.csv")}
        />
        <ExportCard
          title="Attendance"
          description="Check-in/out logs for the selected range."
          icon={<Clock className="w-6 h-6" />}
          onClick={() => run("/exports/attendance", "attendance.csv")}
        />
        <ExportCard
          title="Trainers"
          description="Trainer roster and linked member counts."
          icon={<Database className="w-6 h-6" />}
          onClick={() => run("/exports/trainers", "trainers.csv")}
        />
        <ExportCard
          title="Audit Log"
          description="Immutable record of all admin actions."
          icon={<FileSpreadsheet className="w-6 h-6" />}
          onClick={() => run("/exports/audit", "audit.csv")}
        />
      </div>
    </div>
  );
}

function ExportCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between group hover:border-brand-accent/30 transition-all duration-300">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-6 text-[10px] text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/10"
        onClick={onClick}
      >
        <Download className="w-3 h-3 mr-2" />
        Download CSV
      </Button>
    </div>
  );
}

export default AdminExportsPage;
