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
import { Save, Clock, Monitor } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

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
    colHelper.accessor((r) => r.user.name, { 
      id: "member", 
      header: "Member",
      cell: (ctx) => (
        <div className="flex flex-col">
          <span className="font-bold text-white">{ctx.getValue()}</span>
          <span className="text-[10px] text-brand-muted font-mono">{ctx.row.original.user.email}</span>
        </div>
      )
    }),
    colHelper.accessor("checkInAt", {
      header: "Check-in",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-brand-accent" />
          <span className="font-mono text-xs">{new Date(c.getValue()).toLocaleString()}</span>
        </div>
      ),
    }),
    colHelper.accessor("checkOutAt", {
      header: "Check-out",
      cell: (c) => (
        <div className="flex items-center gap-2">
          {c.getValue() ? (
            <>
              <Clock className="w-3 h-3 text-brand-muted" />
              <span className="font-mono text-xs">{new Date(c.getValue()!).toLocaleString()}</span>
            </>
          ) : (
            <Badge variant="warning" className="text-[8px] px-1.5 py-0">Active Session</Badge>
          )}
        </div>
      ),
    }),
    colHelper.accessor("source", { 
      header: "Source",
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3 h-3 text-brand-muted" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{c.getValue()}</span>
        </div>
      )
    }),
  ];

  const table = useReactTable({
    data: (q.data?.items as Row[]) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Attendance Logs</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Activity tracking for the last 30 days
          </p>
        </div>
      </header>

      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-brand-muted">
            Manual Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Member Email"
              placeholder="member@gym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Check-in Time"
              type="datetime-local"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <Input
              label="Check-out Time (Optional)"
              type="datetime-local"
              className="md:col-span-2"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <Button
              variant="primary"
              className="md:col-span-2 h-11"
              disabled={manualM.isPending || !email || !checkIn}
              onClick={() => manualM.mutate()}
            >
              <Save className="w-4 h-4 mr-2" />
              {manualM.isPending ? "Saving Record..." : "Log Manual Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="glass-card overflow-hidden border-brand-border/20 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-brand-muted border-b border-brand-border/20">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-6 py-4">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-brand-muted italic">
                    {q.isLoading ? "Loading activity..." : "No attendance records found for this period."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
