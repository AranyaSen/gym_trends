import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createPlan,
  deactivatePlan,
  fetchPlans,
  type PlanRow,
} from "../../services/adminApi";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const colHelper = createColumnHelper<PlanRow>();

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { planSchema, type PlanFormValues } from "../../schemas/gym";

export function AdminPlansPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["plans"], queryFn: fetchPlans });
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      price: "",
      days: "30",
    },
  });

  const createM = useMutation({
    mutationFn: (values: PlanFormValues) =>
      createPlan({
        name: values.name,
        priceCents: Math.round(Number(values.price) * 100),
        durationDays: Number(values.days),
      }),
    onSuccess: () => {
      setErr(null);
      void qc.invalidateQueries({ queryKey: ["plans"] });
      reset();
    },
    onError: () => setErr("Could not create plan"),
  });

  const onSubmit = (values: PlanFormValues) => {
    createM.mutate(values);
  };

  const deactM = useMutation({
    mutationFn: (id: string) => deactivatePlan(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["plans"] }),
  });

  const columns = [
    colHelper.accessor("name", { header: "Name" }),
    colHelper.accessor("priceCents", {
      header: "Price (₹)",
      cell: (c) => (c.getValue() / 100).toFixed(2),
    }),
    colHelper.accessor("durationDays", { header: "Days" }),
    colHelper.accessor("isActive", {
      header: "Active",
      cell: (c) => (c.getValue() ? "Yes" : "No"),
    }),
    colHelper.display({
      id: "actions",
      header: "",
      cell: (ctx) =>
        ctx.row.original.isActive ? (
          <button
            type="button"
            className="text-xs text-amber-400 hover:text-amber-300"
            onClick={() => {
              if (
                confirm(
                  "Deactivate this plan? Existing memberships stay as-is."
                )
              ) {
                deactM.mutate(ctx.row.original.id);
              }
            }}
          >
            Deactivate
          </button>
        ) : null,
    }),
  ];

  const table = useReactTable({
    data: q.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Plans</h1>
        <p className="mt-1 text-sm text-slate-400">
          Unlimited tiers; deactivate when retiring a tier.
        </p>
      </div>
      <form
        className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <input
            className={`rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Name"
            {...register("name")}
          />
          {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <input
            className={`rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ${errors.price ? 'border-red-500' : ''}`}
            placeholder="Price INR"
            type="number"
            step="0.01"
            {...register("price")}
          />
          {errors.price && <span className="text-[10px] text-red-500">{errors.price.message}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <input
            className={`rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ${errors.days ? 'border-red-500' : ''}`}
            placeholder="Duration days"
            type="number"
            min={1}
            {...register("days")}
          />
          {errors.days && <span className="text-[10px] text-red-500">{errors.days.message}</span>}
        </div>
        <button
          type="submit"
          disabled={createM.isPending}
          className="rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 h-[38px] mt-0"
        >
          Add plan
        </button>
      </form>
      {err && <p className="text-sm text-red-400">{err}</p>}
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
