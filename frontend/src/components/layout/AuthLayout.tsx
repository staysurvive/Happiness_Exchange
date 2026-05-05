import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="hero-surface flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,215,255,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,215,168,0.18),transparent_20%)]" />
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  )
}
