import { type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children?: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (!isAuthenticated && !loading) {
    const fullPath = location.pathname + location.search
    const redirectParam = encodeURIComponent(fullPath)
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
