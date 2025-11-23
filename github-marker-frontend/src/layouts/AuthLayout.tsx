import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
     <Outlet />
    </div>
  );
}
