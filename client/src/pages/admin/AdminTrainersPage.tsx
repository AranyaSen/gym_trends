import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchMembers,
  fetchTrainers,
  linkTrainerMember,
  unlinkTrainerMember,
} from "../../services/admin/admin.services";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  trainerLinkSchema,
  type TrainerLinkFormValues,
} from "../../schemas/gym";
import { Link2, Unlink, Mail, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

function AdminTrainersPage() {
  const qc = useQueryClient();
  const tq = useQuery({ queryKey: ["trainers"], queryFn: fetchTrainers });
  const mq = useQuery({ queryKey: ["members"], queryFn: () => fetchMembers() });
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TrainerLinkFormValues>({
    resolver: zodResolver(trainerLinkSchema),
    mode: "onChange",
    defaultValues: {
      trainerId: "",
      memberId: "",
    },
  });

  const linkM = useMutation({
    mutationFn: (values: TrainerLinkFormValues) => linkTrainerMember(values),
    onSuccess: () => {
      setMsg("Linked");
      reset();
      void qc.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: () => setMsg("Link failed"),
  });

  const onSubmit = (values: TrainerLinkFormValues) => {
    setMsg(null);
    linkM.mutate(values);
  };

  const unlinkM = useMutation({
    mutationFn: (p: { t: string; m: string }) => unlinkTrainerMember(p.t, p.m),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["trainers"] }),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Trainer Hub</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Link elite trainers with gym members
          </p>
        </div>
      </header>

      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-brand-muted">
            Establish Coaching Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-3 items-end"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Select label="Select Trainer" {...register("trainerId")}>
              <option value="">Choose Trainer...</option>
              {(tq.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Select label="Select Member" {...register("memberId")}>
              <option value="">Choose Member...</option>
              {(mq.data?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </Select>
            <Button
              type="submit"
              disabled={!isValid || linkM.isPending}
              className="w-full h-11"
            >
              <Link2 className="w-4 h-4 mr-2" />
              {linkM.isPending ? "Linking..." : "Confirm Link"}
            </Button>
          </form>
          {msg && (
            <p className="mt-4 text-xs font-bold text-brand-accent uppercase tracking-wider text-center animate-pulse">
              {msg}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tq.isLoading ? (
          <p className="col-span-full text-center py-10 text-brand-muted italic uppercase text-[10px] tracking-widest">
            Loading professional roster...
          </p>
        ) : (tq.data ?? []).length === 0 ? (
          <p className="col-span-full text-center py-10 text-brand-muted italic uppercase text-[10px] tracking-widest">
            No trainers onboarded yet.
          </p>
        ) : (
          (tq.data ?? []).map((t) => (
            <div
              key={t.id}
              className="glass-card p-5 group hover:border-brand-accent/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <Badge variant="info">Verified</Badge>
              </div>

              <div className="space-y-1 mb-6">
                <h3 className="text-white font-black uppercase tracking-tight">
                  {t.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-brand-muted font-bold tracking-wider">
                  <Mail className="w-3 h-3" />
                  {t.email}
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                  onClick={() => {
                    const mid = prompt(`Member ID to unlink from ${t.name}?`);
                    if (mid) unlinkM.mutate({ t: t.id, m: mid });
                  }}
                >
                  <Unlink className="w-3 h-3 mr-2" />
                  Unlink Member
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminTrainersPage;
