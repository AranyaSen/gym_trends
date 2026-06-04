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
} from "../../services/admin/admin.services";
import type { MemberRow } from "../../services/admin/admin.types";
import {
  fetchPlanRequests,
  approvePlanRequest,
  rejectPlanRequest,
} from "../../services/planRequest/planRequest.services";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  UserPlus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  membershipAssignSchema,
  type MembershipAssignFormValues,
} from "../../schemas/gym";

const colHelper = createColumnHelper<MemberRow>();

function AdminMembersPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const plansQ = useQuery({ queryKey: ["plans"], queryFn: fetchPlans });
  const reqsQ = useQuery({
    queryKey: ["planRequests"],
    queryFn: fetchPlanRequests,
  });
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
    mutationFn: ({
      values,
      changeType,
    }: {
      values: MembershipAssignFormValues;
      changeType: "UPGRADE" | "DOWNGRADE";
    }) =>
      switchMembership({
        memberEmail: values.email,
        planId: values.planId,
        changeType,
      }),
    onSuccess: () => {
      setMsg("Plan changed");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Switch failed"),
  });

  const approveM = useMutation({
    mutationFn: approvePlanRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["planRequests"] });
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const rejectM = useMutation({
    mutationFn: rejectPlanRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["planRequests"] });
    },
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
      header: "Active Membership",
      cell: (ctx) => {
        const m = ctx.row.original.memberships[0];
        if (!m) return <Badge variant="neutral">No Active Plan</Badge>;

        const isExpired = new Date(m.endDate) < new Date();

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{m.plan.name}</span>
              <Badge variant={isExpired ? "error" : "success"}>
                {isExpired ? "Expired" : "Active"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-brand-muted font-mono">
              <Calendar className="w-3 h-3" />
              Expires: {new Date(m.endDate).toLocaleDateString()}
            </div>
          </div>
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
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Member Directory</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Manage gym access and subscriptions
          </p>
        </div>
      </header>

      {reqsQ.data && reqsQ.data.length > 0 && (
        <Card className="neon-border border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-yellow-500 flex items-center gap-2">
              Pending Plan Requests ({reqsQ.data.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reqsQ.data.map((req: any) => (
              <div
                key={req.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg gap-4"
              >
                <div>
                  <p className="text-white font-bold">
                    {req.user.name}{" "}
                    <span className="text-brand-muted font-normal">
                      ({req.user.email})
                    </span>
                  </p>
                  <p className="text-sm text-brand-muted mt-1">
                    Requested Plan:{" "}
                    <span className="text-brand-accent font-bold">
                      {req.plan.name}
                    </span>{" "}
                    - ₹{(req.plan.priceCents / 100).toFixed(0)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={approveM.isPending}
                    onClick={() => approveM.mutate(req.id)}
                    className="w-full md:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={rejectM.isPending}
                    onClick={() => rejectM.mutate(req.id)}
                    className="w-full md:w-auto text-red-400 hover:text-red-300"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-brand-muted">
            Update Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Member Email"
                placeholder="search@member.com"
                {...register("email")}
              />
              <Select label="Select Plan" {...register("planId")}>
                <option value="">Choose a plan...</option>
                {(plansQ.data ?? [])
                  .filter((p: any) => p.isActive)
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{(p.priceCents / 100).toFixed(0)} /{" "}
                      {p.durationDays}d
                    </option>
                  ))}
              </Select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleSubmit(onAssign)}
                disabled={!isValid || assignM.isPending}
                className="flex-1 min-w-[140px]"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {assignM.isPending ? "Assigning..." : "Assign Plan"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSubmit(onRenew)}
                disabled={!isValid || renewM.isPending}
                className="flex-1 min-w-[140px]"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${renewM.isPending ? "animate-spin" : ""}`}
                />
                Renew
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit(() => onSwitch("UPGRADE"))}
                disabled={!isValid || switchM.isPending}
                className="flex-1 min-w-[140px] text-emerald-400 border-emerald-500/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit(() => onSwitch("DOWNGRADE"))}
                disabled={!isValid || switchM.isPending}
                className="flex-1 min-w-[140px] text-amber-400 border-amber-500/20"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Downgrade
              </Button>
            </div>
          </form>
          {msg && (
            <p className="mt-4 text-xs font-bold text-brand-accent uppercase tracking-wider text-center animate-pulse">
              {msg}
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
                  <td
                    colSpan={columns.length}
                    className="px-6 py-20 text-center text-brand-muted italic"
                  >
                    {q.isLoading ? "Fetching members..." : "No members found."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
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

export default AdminMembersPage;
