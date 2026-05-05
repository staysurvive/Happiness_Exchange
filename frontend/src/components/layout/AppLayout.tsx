import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { resolveAssetUrl } from '../../lib/assets'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../stores/auth-store'
import { MascotBoundary } from '../mascot/MascotBoundary'
import { JoySprite } from '../mascot/JoySprite'
import { ScrollToTop } from './ScrollToTop'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { PageContainer } from '../ui/PageContainer'

const desktopLinks = [
  { label: '市场', to: '/market', match: '/market' },
  { label: '发布', to: '/publish', match: '/publish' },
  { label: '仓库', to: '/me?tab=collections', match: '/me' },
]

const mobileLinks = [
  { label: '首页', to: '/', icon: 'sparkles' as const },
  { label: '市场', to: '/market', icon: 'bag' as const },
  { label: '发布', to: '/publish', icon: 'plus' as const },
  { label: '我的', to: '/me', icon: 'user' as const },
]

export function AppLayout() {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const currentUser = useAuthStore((state) => state.currentUser)

  const balanceText = useMemo(() => {
    if (!token || !currentUser) return '快乐登录'
    return `${currentUser.points_balance} Joy Coins`
  }, [currentUser, token])

  const avatarUrl = resolveAssetUrl(currentUser?.avatar_url)

  return (
    <div className="app-shell-bg min-h-screen pb-28 md:pb-0">
      <ScrollToTop />

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-2xl">
        <PageContainer className="flex h-[72px] items-center justify-between gap-4">
          <NavLink to="/" className="text-lg font-semibold tracking-[-0.04em] text-neutral-950">
            快乐交易所
          </NavLink>

          <nav className="hidden items-center gap-8 md:flex">
            {desktopLinks.map((item) => {
              const active = location.pathname.startsWith(item.match)
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'border-b-2 pb-1 text-sm font-medium tracking-tight transition duration-200',
                    active
                      ? 'border-neutral-950 text-neutral-950'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700',
                  )}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {token ? (
              <div className="hidden rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 sm:block">
                {balanceText}
              </div>
            ) : (
              <NavLink to="/login" className="hidden sm:block">
                <Button variant="secondary" className="h-10 px-5 text-xs">
                  登录领取快乐
                </Button>
              </NavLink>
            )}
            <button type="button" className="hidden text-neutral-700 transition hover:text-neutral-950 md:inline-flex">
              <Icon name="bell" />
            </button>
            <NavLink
              to={token ? '/me' : '/login'}
              className="inline-flex text-neutral-700 transition hover:text-neutral-950"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={currentUser?.username ?? '我的头像'}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-black/6"
                />
              ) : (
                <Icon name="user" />
              )}
            </NavLink>
          </div>
        </PageContainer>
      </header>

      <Outlet />

      <MascotBoundary>
        <JoySprite />
      </MascotBoundary>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/84 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-4 pb-6 pt-3">
          {mobileLinks.map((item) => {
            const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex min-w-[72px] flex-col items-center justify-center rounded-full px-4 py-2 text-[11px] font-medium transition duration-200',
                  active ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-400',
                )}
              >
                <Icon name={item.icon} className="mb-1 h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
