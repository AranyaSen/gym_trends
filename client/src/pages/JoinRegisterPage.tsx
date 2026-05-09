import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";
import { registerJoin } from "../services/authApi";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

export function JoinRegisterPage() {
  const nav = useNavigate();
  const { setToken } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"MEMBER" | "TRAINER">("MEMBER");
  const [err, setErr] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () =>
      registerJoin({
        joinCode: joinCode.trim(),
        email,
        password,
        name,
        phone: phone || undefined,
        role,
      }),
    onSuccess: (d) => {
      setToken(d.token);
      nav(role === "TRAINER" ? ROUTES.trainer : ROUTES.member, {
        replace: true,
      });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === "object" && "response" in e
          ? String(
              (e as { response?: { data?: { error?: { message?: string } } } })
                .response?.data?.error?.message
            )
          : "Registration failed";
      setErr(msg || "Registration failed");
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
            Join the elite circle
          </p>
        </header>

        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="text-center">Member Registration</CardTitle>
            <p className="mt-2 text-center text-xs text-brand-muted">
              Enter the gym join code provided by your facility.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setErr(null);
                m.mutate();
              }}
            >
              <Input
                label="Join Code"
                placeholder="GYM-XXXX"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />

              <Select
                label="Role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value === "TRAINER" ? "TRAINER" : "MEMBER")
                }
              >
                <option value="MEMBER">Member</option>
                <option value="TRAINER">Trainer</option>
              </Select>

              <Input
                label="Your Name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Phone (Optional)"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

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
                minLength={8}
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
                className="w-full mt-2"
              >
                {m.isPending ? "Joining…" : "Create Account"}
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
