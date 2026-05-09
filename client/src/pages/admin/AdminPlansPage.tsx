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
import { Plus, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

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
      header: "Status",
      cell: (c) => (
        <Badge variant={c.getValue() ? "success" : "neutral"}>
          {c.getValue() ? "Active" : "Retired"}
        </Badge>
      ),
    }),
    colHelper.display({
      id: "actions",
      header: "Actions",
      cell: (ctx) =>
        ctx.row.original.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-400 hover:text-amber-300 h-8 px-2"
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
            <ShieldAlert className="w-4 h-4 mr-1" />
            Retire
          </Button>
        ) : (
          <span className="text-[10px] text-brand-muted uppercase font-bold italic">No actions</span>
        ),
    }),
  ];

  const table = useReactTable({
    data: q.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Membership Plans</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Configure your gym's subscription tiers
          </p>
        </div>
      </header>

      <Card className="neon-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-brand-muted">
            Create New Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-4 items-end"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              label="Tier Name"
              placeholder="e.g. Gold Monthly"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Price (INR)"
              placeholder="2999"
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Duration (Days)"
              placeholder="30"
              type="number"
              min={1}
              error={errors.days?.message}
              {...register("days")}
            />
            <Button
              type="submit"
              disabled={createM.isPending}
              className="w-full h-11"
            >
              {createM.isPending ? "Creating..." : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </>
              )}
            </Button>
          </form>
          {err && (
            <p className="mt-4 text-xs font-bold text-red-400 uppercase tracking-wider text-center">
              {err}
            </p>
          )}
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
                    {q.isLoading ? "Loading tiers..." : "No membership plans found."}
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
