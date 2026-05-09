import { useState } from "react";
import { downloadExport } from "../../services/adminApi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exportSchema, type ExportFormValues } from "../../schemas/gym";

export function AdminExportsPage() {
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    getValues,
  } = useForm<ExportFormValues>({
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
      setErr("Export failed — check date range.")
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Exports</h1>
        <p className="mt-1 text-sm text-slate-400">
          Default window is last 30 days if dates are empty.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <label className="text-xs text-slate-400">
          From
          <input
            type="date"
            className="mt-1 block rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
            {...register("from")}
          />
        </label>
        <label className="text-xs text-slate-400">
          To
          <input
            type="date"
            className="mt-1 block rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
            {...register("to")}
          />
        </label>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
          onClick={() => run("/exports/members", "members.csv")}
        >
          Members CSV
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
          onClick={() => run("/exports/attendance", "attendance.csv")}
        >
          Attendance CSV
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
          onClick={() => run("/exports/trainers", "trainers.csv")}
        >
          Trainers CSV
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
          onClick={() => run("/exports/audit", "audit.csv")}
        >
          Audit CSV
        </button>
      </div>
    </div>
  );
}
