import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  createPlan,
  deactivatePlan,
  fetchPlans,
} from "../../services/admin/admin.services";
import type { PlanRow } from "../../services/admin/admin.types";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "../../query/queryClient";
import { PlanFormValues, planSchema } from "../../schemas/plan/planSchema";
import { Table } from "../../components/ui/Table";

function AdminPlansPage() {
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });
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

  const createMembershipMutation = useMutation({
    mutationFn: (values: PlanFormValues) =>
      createPlan({
        name: values.name,
        priceCents: Math.round(Number(values.price) * 100),
        durationDays: Number(values.days),
      }),
    onSuccess: () => {
      setErr(null);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      reset();
    },
    onError: (err: any) => setErr(err?.message),
  });

  const onSubmit = (values: PlanFormValues) => {
    createMembershipMutation.mutate(values);
  };

  const deactivateMembershipMutation = useMutation({
    mutationFn: (id: string) => deactivatePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const handlePlanDeactivation = (id: string) => {
    if (confirm("Deactivate this plan? Existing memberships stay as-is.")) {
      deactivateMembershipMutation.mutate(id);
    }
  };

  const columnHelper = createColumnHelper<PlanRow>();

  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("priceCents", {
      header: "Price (₹)",
      cell: (data) => (data.getValue() / 100).toFixed(2),
    }),
    columnHelper.accessor("durationDays", { header: "Days" }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (data) => (
        <Badge variant={data.getValue() ? "success" : "neutral"}>
          {data.getValue() ? "Active" : "Deactivated"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (ctx) =>
        ctx.row.original.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-400 hover:text-amber-300 h-8 px-2"
            onClick={() => handlePlanDeactivation(ctx.row.original.id)}
          >
            <ShieldAlert className="w-4 h-4 mr-1" />
            Deactivate
          </Button>
        ) : (
          <span className="text-[10px] text-brand-muted uppercase font-bold italic">
            No actions
          </span>
        ),
    }),
  ];

  const table = useReactTable({
    data: plansData ?? [],
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
              disabled={createMembershipMutation.isPending}
              className="w-full h-11"
            >
              {createMembershipMutation.isPending ? (
                "Creating..."
              ) : (
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
          <Table table={table} loading={plansLoading} />
        </div>
      </div>
    </div>
  );
}

export default AdminPlansPage;
