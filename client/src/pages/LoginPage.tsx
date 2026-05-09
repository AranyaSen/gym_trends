import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authApi";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

function homeForRole(role: string) {
  if (role === "ADMIN") return ROUTES.admin;
  if (role === "TRAINER") return ROUTES.trainer;
  return ROUTES.member;
}

export function LoginPage() {
  const nav = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: (d) => {
      setToken(d.token);
      const role = (d.user as { role: string }).role;
      nav(homeForRole(role), { replace: true });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message
            )
          : "Login failed";
      setErr(msg || "Login failed");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <header className="text-center space-y-2">
          <Link to={ROUTES.home} className="inline-block transition-transform hover:scale-105">
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
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                m.mutate();
              }}
            >
              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
                  {err}
                </div>
              )}

              <Button
                type="submit"
                disabled={m.isPending}
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
            to={ROUTES.home}
          >
            ← Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}

