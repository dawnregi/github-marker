import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

type ErrorFallbackProps = {
  error?: Error;
  resetError?: () => void;
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Oops! Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            {error?.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>

        {resetError && (
          <Button onClick={resetError} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
