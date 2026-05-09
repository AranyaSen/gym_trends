import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  assignMembership,
  fetchMembers,
  fetchPlans,
  renewMembership,
  switchMembership,
  type MemberRow,
} from "../../services/adminApi";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const colHelper = createColumnHelper<MemberRow>();

export function AdminMembersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const plansQ = useQuery({ queryKey: ["plans"], queryFn: fetchPlans });
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const assignM = useMutation({
    mutationFn: () => assignMembership({ memberEmail: email, planId }),
    onSuccess: () => {
      setMsg("Membership assigned");
      void qc.invalidateQueries({ queryKey: ["members"] });
      setEmail("");
    },
    onError: () => setMsg("Assign failed"),
  });

  const renewM = useMutation({
    mutationFn: () => renewMembership({ memberEmail: email, planId }),
    onSuccess: () => {
      setMsg("Renewed");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Renew failed"),
  });

  const switchM = useMutation({
    mutationFn: (changeType: "UPGRADE" | "DOWNGRADE") =>
      switchMembership({ memberEmail: email, planId, changeType }),
    onSuccess: () => {
      setMsg("Plan changed");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Switch failed"),
  });

  const columns = [
    colHelper.accessor("name", { header: "Name" }),
    colHelper.accessor("email", { header: "Email" }),
    colHelper.display({
      id: "plan",
      header: "Plan / expiry",
      cell: (ctx) => {
        const m = ctx.row.original.memberships[0];
        if (!m) return <span className="text-slate-500">—</span>;
        return (
          <span>
            {m.plan.name} · {new Date(m.endDate).toLocaleDateString()}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: q.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Members</h1>
        <p className="mt-1 text-sm text-slate-400">
          Assign, renew, or change plans by member email.
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-3">
        <input
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          placeholder="Member email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          <option value="">Select plan</option>
          {(plansQ.data ?? [])
            .filter((p) => p.isActive)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{(p.priceCents / 100).toFixed(0)} / {p.durationDays}d
              </option>
            ))}
        </select>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-indigo-600 px-3 py-2 text-xs text-white"
            onClick={() => assignM.mutate()}
            disabled={!email || !planId}
          >
            Assign
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-2 text-xs text-white"
            onClick={() => renewM.mutate()}
            disabled={!email || !planId}
          >
            Renew
          </button>
          <button
            type="button"
            className="rounded bg-emerald-700 px-3 py-2 text-xs text-white"
            onClick={() => switchM.mutate("UPGRADE")}
            disabled={!email || !planId}
          >
            Upgrade
          </button>
          <button
            type="button"
            className="rounded bg-amber-700 px-3 py-2 text-xs text-white"
            onClick={() => switchM.mutate("DOWNGRADE")}
            disabled={!email || !planId}
          >
            Downgrade
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
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
