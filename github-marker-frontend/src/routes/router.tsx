import { lazy } from 'react'
import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import ErrorFallback from '@/components/ErrorFallback'
import { useAuthStore } from '@/store/authStore';
// Lazy load layouts
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'))
const MainLayout = lazy(() => import('@/layouts/MainLayout'))

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const Searchpage = lazy(() => import('@/pages/Searchpage'))



export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

export const mainRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  
  component: MainLayout,
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({
        to: '/auth/login',
      })
    }
  },
})

export const authRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthLayout,
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({
        to: '/app/dashboard',
      })
    }
  },
})

// Auth routes
export const loginRoute = createRoute({
  getParentRoute: () => authRootRoute,
  path: '/login',
  component: LoginPage,
})

export const registerRoute = createRoute({
  getParentRoute: () => authRootRoute,
  path: '/register',
  component: RegisterPage,
})

// App routes
export const dashboardRoute = createRoute({
  getParentRoute: () => mainRootRoute,
  path: '/dashboard',
  component: Dashboard,
})

export const searchRoute = createRoute({
  getParentRoute: () => mainRootRoute,
  path: '/search',
  component: Searchpage,
})

export const routeTree = rootRoute.addChildren([
  landingRoute,
  mainRootRoute.addChildren([
    dashboardRoute,
    searchRoute,
  ]),
  authRootRoute.addChildren([
    loginRoute,
    registerRoute,
  ]),
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
