import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authApi";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { loginSchema, type LoginFormValues } from "../schemas/auth";

function homeForRole(role: string) {
  if (role === "ADMIN") return ROUTES.ADMIN;
  if (role === "TRAINER") return ROUTES.TRAINER;
  return ROUTES.MEMBER;
}

export function LoginPage() {
  const nav = useNavigate();
  const { setToken } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const m = useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: (d) => {
      setToken(d.token);
      const role = (d.user as { role: string }).role;
      nav(homeForRole(role), { replace: true });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (
                e as {
                  response?: {
                    data?: {
                      error?: { message?: string };
                    };
                  };
                }
              ).response?.data?.error?.message,
            )
          : "Login failed";

      setError("root.auth", {
        type: "server",
        message: msg || "Login failed",
      });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    m.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <Link
            to={ROUTES.HOME}
            className="inline-block transition-transform hover:scale-105"
          >
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              GYM-TRAC
            </h1>
          </Link>
          <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px]">
            Welcome back, Athlete
          </p>
        </header>

        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="text-center">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                {...register("email", {
                  onChange: () => {
                    clearErrors("root.auth");
                  },
                })}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  onChange: () => {
                    clearErrors("root.auth");
                  },
                })}
                error={errors.password?.message}
              />

              {errors.root?.auth?.message && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
                  {errors.root.auth.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={m.isPending || !isValid}
                className="w-full"
              >
                {m.isPending ? "Signing in…" : "Access Gym"}
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
