import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../feedback/LoadingState'
import { useAuthStore } from '../../stores/auth-store'

export function PublicOnlyRoute() {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)

  if (!hydrated) {
    return <LoadingState title="正在恢复快乐入口" description="请稍等。" />
  }

  if (token) {
    return <Navigate to="/me" replace />
  }

  return <Outlet />
}
