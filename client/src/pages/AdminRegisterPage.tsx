import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { registerAdmin } from "../services/auth/auth.services";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminRegisterSchema,
  type AdminRegisterFormValues,
} from "../schemas/auth";

export function AdminRegisterPage() {
  const nav = useNavigate();
  const { setToken } = useAuth();
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AdminRegisterFormValues>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      gymName: "",
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const m = useMutation({
    mutationFn: (values: AdminRegisterFormValues) => registerAdmin(values),
    onSuccess: (d) => {
      setToken(d.token);
      nav(ROUTES.ADMIN_SETUP, { replace: true });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message,
            )
          : "Registration failed";
      setErr(msg || "Registration failed");
    },
  });

  const onSubmit = (values: AdminRegisterFormValues) => {
    setErr(null);
    m.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="text-center">Gym Registration</CardTitle>
            <p className="mt-2 text-center text-xs text-brand-muted">
              Create your gym and start managing your members.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Gym Name"
                placeholder="Elite Fitness Center"
                {...register("gymName")}
                error={errors.gymName?.message}
              />

              <Input
                label="Your Name"
                placeholder="John Doe"
                {...register("name")}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />

              {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                disabled={m.isPending || !isValid}
                className="w-full mt-2"
              >
                {m.isPending ? "Creating…" : "Create Gym"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="text-center">
          <Link
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
            to={ROUTES.HOME}
          >
            ← Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}
