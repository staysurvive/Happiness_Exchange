import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../feedback/LoadingState'
import { useAuthStore } from '../../stores/auth-store'

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const location = useLocation()

  if (!hydrated) {
    return <LoadingState title="正在确认登录状态" description="马上就好。" />
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}
