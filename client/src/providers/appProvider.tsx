import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../query/queryClient";
import { ToastProvider } from "../components/ui/Toast";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};
