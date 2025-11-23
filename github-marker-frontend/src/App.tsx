import { Suspense } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes/router";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";
import LoadingFallback from "./components/LoadingFallback";
import { AuthProvider } from "./components/AuthProvider";
import { HelmetProvider } from "react-helmet-async";

function App() {
  const queryClient = new QueryClient();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
