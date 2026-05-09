import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchMembers,
  fetchTrainers,
  linkTrainerMember,
  unlinkTrainerMember,
} from "../../services/adminApi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trainerLinkSchema, type TrainerLinkFormValues } from "../../schemas/gym";

export function AdminTrainersPage() {
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
    mutationFn: (p: { t: string; m: string }) =>
      unlinkTrainerMember(p.t, p.m),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["trainers"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Trainers</h1>
        <p className="mt-1 text-sm text-slate-400">
          Link trainers to members (many-to-many).
        </p>
      </div>
      <form
        className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          {...register("trainerId")}
        >
          <option value="">Trainer</option>
          {(tq.data ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          {...register("memberId")}
        >
          <option value="">Member</option>
          {(mq.data?.items ?? []).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          disabled={!isValid || linkM.isPending}
        >
          {linkM.isPending ? "Linking…" : "Link"}
        </button>
      </form>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <ul className="space-y-2 text-sm text-slate-300">
        {(tq.data ?? []).map((t) => (
          <li key={t.id} className="rounded border border-slate-800 p-3">
            <div className="font-medium text-white">{t.name}</div>
            <div className="text-xs text-slate-500">{t.email}</div>
            <button
              type="button"
              className="mt-2 text-xs text-amber-400"
              onClick={() => {
                const mid = prompt("Member user id to unlink?");
                if (mid) unlinkM.mutate({ t: t.id, m: mid });
              }}
            >
              Unlink by member id…
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
