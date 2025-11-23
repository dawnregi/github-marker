import Header from '@/components/Header'
import { Outlet } from '@tanstack/react-router'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
