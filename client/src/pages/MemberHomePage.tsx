import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function MemberHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10 text-center">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Member Dashboard</h1>
          <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px]">
            Welcome to the powerhouse
          </p>
        </header>

        <Card className="neon-border overflow-hidden">
          <div className="h-2 w-full bg-brand-accent" />
          <CardHeader>
            <CardTitle>Training Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-brand-accent/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-t-4 border-brand-accent animate-spin-slow" />
                <span className="text-2xl font-black text-brand-accent">90%</span>
              </div>
            </div>
            <p className="text-sm text-brand-muted px-4 leading-relaxed">
              Your membership is active. Scan the QR code at the gym entrance to log your session.
            </p>
            <Link to={ROUTES.memberScan} className="block">
              <Button size="lg" className="w-full h-14 text-lg">
                Scan Attendance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <footer className="pt-4">
          <Link 
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors" 
            to={ROUTES.home}
          >
            ← Sign Out
          </Link>
        </footer>
      </div>
    </div>
  );
}

