import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignMembership,
  fetchMembers,
  fetchPlans,
  renewMembership,
} from "../../services/admin/admin.services";
import type { MemberRow } from "../../services/admin/admin.types";
import {
  fetchPlanRequests,
  approvePlanRequest,
  rejectPlanRequest,
} from "../../services/planRequest/planRequest.services";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  UserPlus,
  RefreshCw,
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
import { queryClient } from "../../query/queryClient";
import { Table } from "../../components/ui/Table";

function AdminMembersPage() {
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () => fetchMembers(),
  });
  const { data: plansData } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });
  const { data: reqsData } = useQuery({
    queryKey: ["planRequests"],
    queryFn: fetchPlanRequests,
  });
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<MembershipAssignFormValues>({
    resolver: zodResolver(membershipAssignSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      planId: "",
    },
  });

  const assignPlanMutation = useMutation({
    mutationFn: (values: MembershipAssignFormValues) =>
      assignMembership({ memberEmail: values.email, planId: values.planId }),
    onSuccess: () => {
      setMsg("Membership assigned");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Assign failed"),
  });

  const renewPlanMutation = useMutation({
    mutationFn: (values: MembershipAssignFormValues) =>
      renewMembership({ memberEmail: values.email, planId: values.planId }),
    onSuccess: () => {
      setMsg("Renewed");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => setMsg("Renew failed"),
  });

  const approvePlanRequestMutation = useMutation({
    mutationFn: approvePlanRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planRequests"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const rejectPlanRequestMutation = useMutation({
    mutationFn: rejectPlanRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planRequests"] });
    },
  });

  const onAssign = (values: MembershipAssignFormValues) => {
    setMsg(null);
    assignPlanMutation.mutate(values);
  };

  const onRenew = (values: MembershipAssignFormValues) => {
    setMsg(null);
    renewPlanMutation.mutate(values);
  };

  const colHelper = createColumnHelper<MemberRow>();

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
    data: membersData?.items ?? [],
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

      {reqsData && reqsData.length > 0 && (
        <Card className="neon-border border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-yellow-500 flex items-center gap-2">
              Pending Plan Requests ({reqsData.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reqsData.map((req: any) => (
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
                    disabled={approvePlanRequestMutation.isPending}
                    onClick={() => approvePlanRequestMutation.mutate(req.id)}
                    className="w-full md:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={rejectPlanRequestMutation.isPending}
                    onClick={() => rejectPlanRequestMutation.mutate(req.id)}
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
                {(plansData ?? [])
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
                disabled={!isValid || assignPlanMutation.isPending}
                className="flex-1 min-w-[140px]"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {assignPlanMutation.isPending ? "Assigning..." : "Assign Plan"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSubmit(onRenew)}
                disabled={!isValid || renewPlanMutation.isPending || true}
                className="flex-1 min-w-[140px]"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${renewPlanMutation.isPending ? "animate-spin" : ""}`}
                />
                Renew
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
          <Table table={table} loading={membersLoading} />
        </div>
      </div>
    </div>
  );
}

export default AdminMembersPage;
