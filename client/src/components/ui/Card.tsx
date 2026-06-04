import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx("glass-card p-6", className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={clsx("text-lg font-bold text-white", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={clsx("", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div
      className={clsx("mt-6 pt-4 border-t border-brand-border/30", className)}
    >
      {children}
    </div>
  );
}
