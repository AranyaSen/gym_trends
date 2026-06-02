import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: 0,
    },
    mutations: {
      retry: 0,
    },
  },
});
