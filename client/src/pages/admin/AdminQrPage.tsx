import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ROUTES } from "../../constants/routes";
import { generateQrToken } from "../../services/auth/auth.services";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

function AdminQrPage() {
  const [entry, setEntry] = useState<{
    token: string;
    expiresAt: string;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const mintEntry = useMutation({
    mutationFn: () => generateQrToken({ type: "ENTRY" }),
    onSuccess: (d) => {
      setEntry(d);
      setErr(null);
    },
    onError: () => setErr("Could not mint entry QR"),
  });

  useEffect(() => {
    mintEntry.mutate();
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => {
        mintEntry.mutate();
      },
      5 * 60 * 1000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg md:bg-transparent">
      <div className="w-full max-w-md space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white">Entry Terminal</h1>
          <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px]">
            Station ID: GYM-MAIN-01 • Next Refresh in ~5M
          </p>
        </header>

        {err && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-wider text-center animate-pulse">
            {err}
          </div>
        )}

        <Card className="neon-border flex flex-col items-center text-center space-y-6 py-10 scale-100 md:hover:scale-[1.02] transition-transform">
          <div className="space-y-2">
            <Badge variant="success" className="text-lg px-6 py-1">
              Entry
            </Badge>
            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-2">
              Scan to Start Training
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            {entry?.token ? (
              <QRCodeSVG value={entry.token} size={220} level="H" />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-100 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-bg" />
              </div>
            )}
          </div>

          <div className="w-16 h-1 bg-brand-accent rounded-full" />
        </Card>

        <footer className="text-center pt-6">
          <Link
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
            to={ROUTES.ADMIN}
          >
            ← Back to Dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default AdminQrPage;
