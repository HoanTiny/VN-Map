"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domMax } from "framer-motion";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={domMax} strict>
          <ToastProvider>{children}</ToastProvider>
        </LazyMotion>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
