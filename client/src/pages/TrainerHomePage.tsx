import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { fetchAssignedMembers } from "../services/trainerApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

function TrainerHomePage() {
  const q = useQuery({
    queryKey: ["trainer-members"],
    queryFn: fetchAssignedMembers,
  });

  return (
    <div className="min-h-screen py-10 px-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white">Trainer Hub</h1>
            <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
              Command Center & Member Management
            </p>
          </div>
          <Link to={ROUTES.memberScan}>
            <Button size="lg" className="h-12 px-8">
              Scan Attendance
            </Button>
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
              <span className="w-8 h-[1px] bg-brand-accent" />
              Assigned Members
            </h2>

            {q.isLoading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent" />
              </div>
            )}

            {(q.data ?? []).length === 0 && !q.isLoading && (
              <Card className="py-20 text-center border-dashed border-brand-border/50">
                <p className="text-brand-muted italic">
                  No active member assignments yet.
                </p>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {(q.data ?? []).map((m) => (
                <Card
                  key={m.id}
                  className="hover:border-brand-accent/30 transition-all group"
                >
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="info">Active</Badge>
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-colors" />
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-brand-accent transition-colors">
                        {m.name}
                      </h3>
                      <p className="text-xs text-brand-muted font-medium mt-1 truncate">
                        {m.email}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-brand-border/30 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-muted">
                      <span>Daily Goal</span>
                      <span className="text-brand-accent">80%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
              <span className="w-8 h-[1px] bg-brand-accent" />
              Quick Info
            </h2>
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="text-sm">Session Logging</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Trainers must log their own attendance daily. Click the scan
                  button and use the QR code provided at the station.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default TrainerHomePage;
