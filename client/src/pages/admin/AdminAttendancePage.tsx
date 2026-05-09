import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createManualAttendance,
  fetchAttendance,
} from "../../services/adminApi";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Row = {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  source: string;
  user: { email: string; name: string };
};

const colHelper = createColumnHelper<Row>();

export function AdminAttendancePage() {
  const qc = useQueryClient();
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 86400000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const q = useQuery({
    queryKey: ["attendance", range],
    queryFn: () =>
      fetchAttendance({
        from: range.from,
        to: range.to,
        take: "100",
        skip: "0",
      }),
  });

  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const manualM = useMutation({
    mutationFn: () =>
      createManualAttendance({
        memberEmail: email,
        checkInAt: new Date(checkIn).toISOString(),
        checkOutAt: checkOut ? new Date(checkOut).toISOString() : null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendance"] });
      setEmail("");
      setCheckIn("");
      setCheckOut("");
    },
  });

  const columns = [
    colHelper.accessor((r) => r.user.name, { id: "member", header: "Member" }),
    colHelper.accessor((r) => r.user.email, { id: "em", header: "Email" }),
    colHelper.accessor("checkInAt", {
      header: "Check-in",
      cell: (c) => new Date(c.getValue()).toLocaleString(),
    }),
    colHelper.accessor("checkOutAt", {
      header: "Check-out",
      cell: (c) =>
        c.getValue() ? new Date(c.getValue()!).toLocaleString() : "—",
    }),
    colHelper.accessor("source", { header: "Source" }),
  ];

  const table = useReactTable({
    data: (q.data?.items as Row[]) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">
          Last 30 days of records; add manual entries (up to 7 days back).
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2">
        <label className="text-xs text-slate-400">
          Member email
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="text-xs text-slate-400">
          Check-in (local)
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </label>
        <label className="text-xs text-slate-400 md:col-span-2">
          Check-out (optional)
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="rounded bg-indigo-600 px-3 py-2 text-sm text-white md:col-span-2"
          disabled={manualM.isPending || !email || !checkIn}
          onClick={() => manualM.mutate()}
        >
          Save manual attendance
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="px-3 py-2">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
