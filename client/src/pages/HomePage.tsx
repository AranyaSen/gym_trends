import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { Button } from "../components/ui/Button";

export function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-10">
        <header className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            GYM-TRAC
          </h1>
          <p className="text-lg md:text-xl text-brand-muted max-w-lg mx-auto leading-relaxed">
            Multi-tenant gym membership, QR attendance, and automated system
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={ROUTES.ADMIN_REGISTER}>
            <Button size="lg" className="w-56">
              Register a gym (Owner)
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="outline" size="lg" className="w-56">
              Join with gym code
            </Button>
          </Link>
        </div>

        <footer className="pt-10">
          <Link
            className="text-sm font-bold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors"
            to={ROUTES.LOGIN}
          >
            Already a member? Log in
          </Link>
        </footer>
      </div>
    </div>
  );
}
