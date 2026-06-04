import React from "react";

interface LoaderProps {
  message?: string;
  isLoading?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message,
  isLoading = true,
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-bg/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="relative flex items-center justify-center">
          {/* Outer fast spinning ring */}
          <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-brand-accent border-t-transparent neon-glow"></div>

          {/* Inner slow spinning ring */}
          <div className="absolute h-14 w-14 animate-[spin_3s_linear_infinite_reverse] rounded-full border-4 border-brand-accent/40 border-b-transparent"></div>

          {/* Core pulse */}
          <div className="h-8 w-8 rounded-full bg-brand-accent/20 animate-pulse neon-glow"></div>
        </div>

        {message && (
          <p className="text-sm font-bold tracking-widest text-brand-accent uppercase animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
