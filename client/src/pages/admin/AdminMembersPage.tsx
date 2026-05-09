import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { membershipAssignSchema, type MembershipAssignFormValues } from "../../schemas/gym";

const colHelper = createColumnHelper<MemberRow>();

export function AdminMembersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const plansQ = useQuery({ queryKey: ["plans"], queryFn: fetchPlans });
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm<MembershipAssignFormValues>({
    resolver: zodResolver(membershipAssignSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      planId: "",
    },
  });

  const assignM = useMutation({
    mutationFn: (values: MembershipAssignFormValues) => 
      assignMembership({ memberEmail: values.email, planId: values.planId }),
    onSuccess: () => {
      setMsg("Membership assigned");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Assign failed"),
  });

  const renewM = useMutation({
    mutationFn: (values: MembershipAssignFormValues) => 
      renewMembership({ memberEmail: values.email, planId: values.planId }),
    onSuccess: () => {
      setMsg("Renewed");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Renew failed"),
  });

  const switchM = useMutation({
    mutationFn: ({ values, changeType }: { values: MembershipAssignFormValues; changeType: "UPGRADE" | "DOWNGRADE" }) =>
      switchMembership({ memberEmail: values.email, planId: values.planId, changeType }),
    onSuccess: () => {
      setMsg("Plan changed");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Switch failed"),
  });

  const onAssign = (values: MembershipAssignFormValues) => {
    setMsg(null);
    assignM.mutate(values);
  };

  const onRenew = (values: MembershipAssignFormValues) => {
    setMsg(null);
    renewM.mutate(values);
  };

  const onSwitch = (changeType: "UPGRADE" | "DOWNGRADE") => {
    const values = getValues();
    setMsg(null);
    switchM.mutate({ values, changeType });
  };

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
          {...register("email")}
        />
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          {...register("planId")}
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
            className="rounded bg-indigo-600 px-3 py-2 text-xs text-white disabled:opacity-50"
            onClick={handleSubmit(onAssign)}
            disabled={!isValid}
          >
            Assign
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-2 text-xs text-white disabled:opacity-50"
            onClick={handleSubmit(onRenew)}
            disabled={!isValid}
          >
            Renew
          </button>
          <button
            type="button"
            className="rounded bg-emerald-700 px-3 py-2 text-xs text-white disabled:opacity-50"
            onClick={handleSubmit(() => onSwitch("UPGRADE"))}
            disabled={!isValid}
          >
            Upgrade
          </button>
          <button
            type="button"
            className="rounded bg-amber-700 px-3 py-2 text-xs text-white disabled:opacity-50"
            onClick={handleSubmit(() => onSwitch("DOWNGRADE"))}
            disabled={!isValid}
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
