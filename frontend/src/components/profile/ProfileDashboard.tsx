import { useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { checkinsApi } from '../../features/checkins/api'
import { currentUserQueryKey } from '../../features/auth/hooks'
import { usersApi } from '../../features/users/api'
import { resolveAssetUrl } from '../../lib/assets'
import { cn } from '../../lib/cn'
import { formatDate, formatDateTime, getInitial } from '../../lib/format'
import { queryClient } from '../../lib/query-client'
import { useAuthStore } from '../../stores/auth-store'
import { EmptyState } from '../feedback/EmptyState'
import { ErrorState } from '../feedback/ErrorState'
import { LoadingState } from '../feedback/LoadingState'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'
import { PageContainer } from '../ui/PageContainer'
import { ProductCard } from '../ui/ProductCard'

type ProfileTab = 'published' | 'purchases' | 'collections' | 'points' | 'gifts'

const tabs: Array<{ key: ProfileTab; label: string }> = [
  { key: 'published', label: '我发布的快乐' },
  { key: 'purchases', label: '我收到的快乐' },
  { key: 'collections', label: '我收藏的快乐' },
  { key: 'gifts', label: '收到的礼物' },
  { key: 'points', label: '快乐流水' },
]

const transactionIconMap: Record<string, 'calendar' | 'bag' | 'plus'> = {
  checkin_reward: 'calendar',
  purchase_spend: 'bag',
  product_publish_reward: 'plus',
}

export function ProfileDashboard({ initialTab = 'published' }: { initialTab?: ProfileTab }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const logout = useAuthStore((state) => state.logout)
  const currentUser = useAuthStore((state) => state.currentUser)
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser)

  const activeTab = (searchParams.get('tab') as ProfileTab | null) ?? initialTab

  const meQuery = useQuery({ queryKey: ['me', 'profile'], queryFn: usersApi.getMe })
  const personaQuery = useQuery({ queryKey: ['me', 'persona'], queryFn: usersApi.getMyPersona })
  const avatarOptionsQuery = useQuery({
    queryKey: ['me', 'avatar-options'],
    queryFn: usersApi.getAvatarOptions,
  })
  const pointsQuery = useQuery({ queryKey: ['me', 'points'], queryFn: () => usersApi.getMyPoints(1, 20) })
  const productsQuery = useQuery({ queryKey: ['me', 'products'], queryFn: () => usersApi.getMyProducts(1, 6) })
  const purchasesQuery = useQuery({ queryKey: ['me', 'purchases'], queryFn: () => usersApi.getMyPurchases(1, 6) })
  const collectionsQuery = useQuery({ queryKey: ['me', 'collections'], queryFn: () => usersApi.getMyCollections(1, 6) })
  const giftsQuery = useQuery({ queryKey: ['me', 'gifts'], queryFn: () => usersApi.getMyGifts(1, 6) })
  const checkinQuery = useQuery({ queryKey: ['me', 'checkin'], queryFn: checkinsApi.getStatus })

  const checkinMutation = useMutation({
    mutationFn: checkinsApi.checkIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: usersApi.updateMyAvatar,
    onSuccess: (user) => {
      setCurrentUser(user)
      void queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })

  const profile = meQuery.data ?? currentUser
  const currentAvatarUrl = resolveAssetUrl(profile?.avatar_url)
  const avatarOptions = avatarOptionsQuery.data?.items ?? []

  const headerStats = useMemo(
    () => ({
      published: productsQuery.data?.total ?? 0,
      collected: collectionsQuery.data?.total ?? 0,
      purchases: purchasesQuery.data?.total ?? 0,
      gifts: giftsQuery.data?.total ?? 0,
    }),
    [
      collectionsQuery.data?.total,
      giftsQuery.data?.total,
      productsQuery.data?.total,
      purchasesQuery.data?.total,
    ],
  )

  function setTab(tab: ProfileTab) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    setSearchParams(next)
  }

  function pickRandomAvatar() {
    if (!avatarOptions.length || updateAvatarMutation.isPending) {
      return
    }

    const candidates = avatarOptions.filter((option) => option.image_url !== profile?.avatar_url)
    const pool = candidates.length ? candidates : avatarOptions
    const next = pool[Math.floor(Math.random() * pool.length)]
    if (!next) return
    void updateAvatarMutation.mutate(next.image_url)
  }

  if (meQuery.isLoading && !profile) {
    return (
      <PageContainer className="py-10 md:py-16">
        <LoadingState title="正在打开你的快乐仓库" />
      </PageContainer>
    )
  }

  if (meQuery.isError && !profile) {
    return (
      <PageContainer className="py-10 md:py-16">
        <ErrorState description="个人中心暂时无法加载。" onRetry={() => meQuery.refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-10 md:py-16">
      <section className="mb-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt={profile?.username ?? '我的头像'}
              className="h-[96px] w-[96px] rounded-full object-cover shadow-sm ring-4 ring-white"
            />
          ) : (
            <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-gradient-to-br from-white via-accent-blue/25 to-accent-orange/25 text-3xl font-semibold text-neutral-700 shadow-sm ring-4 ring-white">
              {getInitial(profile?.username)}
            </div>
          )}
          <div>
            <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-neutral-950 md:text-[46px]">
              {profile?.username ?? 'Healing Seeker'}
            </h1>
            <p className="mt-2 text-base text-neutral-500">注册于 {formatDate(profile?.created_at)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge tone="blue">Explorer</Badge>
              <Badge tone="pink">Joy Maker</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={logout}
            iconLeft={<Icon name="logout" className="h-4 w-4" />}
          >
            退出登录
          </Button>
        </div>
      </section>

      <section className="mb-10">
        <Card className="px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">头像选择</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-neutral-950">
                选一个更适合你的快乐头像
              </h2>
              <p className="mt-2 text-sm leading-7 text-neutral-500">
                头像会同步展示在导航、个人中心、商品作者信息和评论区。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="h-10 px-5 text-xs"
                disabled={!avatarOptions.length || updateAvatarMutation.isPending}
                onClick={pickRandomAvatar}
              >
                随机换一个
              </Button>
              {updateAvatarMutation.isPending ? (
                <p className="text-sm text-neutral-500">头像更新中…</p>
              ) : null}
            </div>
          </div>

          {avatarOptionsQuery.isLoading ? (
            <div className="mt-6">
              <LoadingState title="正在加载头像素材" description="请稍等。" />
            </div>
          ) : avatarOptionsQuery.isError ? (
            <div className="mt-6">
              <ErrorState description="头像素材加载失败。" onRetry={() => avatarOptionsQuery.refetch()} />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {avatarOptionsQuery.data?.items.map((option) => {
                const optionUrl = resolveAssetUrl(option.image_url)
                const active = profile?.avatar_url === option.image_url
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      void updateAvatarMutation.mutate(option.image_url)
                    }}
                    disabled={updateAvatarMutation.isPending}
                    className={cn(
                      'rounded-[28px] border bg-white p-3 text-center transition',
                      active
                        ? 'avatar-option-active border-neutral-950 shadow-[0_12px_24px_rgba(17,24,39,0.12)]'
                        : 'border-black/8 hover:border-neutral-300',
                    )}
                  >
                    {optionUrl ? (
                      <img
                        src={optionUrl}
                        alt={option.label}
                        className="mx-auto h-24 w-24 rounded-full object-cover"
                      />
                    ) : null}
                    <p className="mt-3 text-sm font-medium text-neutral-900">{option.label}</p>
                    <p className="mt-1 text-xs text-neutral-400">{active ? '当前使用中' : '点击使用'}</p>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </section>

      <section className="mb-10 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="glass-panel px-6 py-7 md:px-8 md:py-8">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            <Icon name="sparkles" className="h-4 w-4 text-accent-orange" />
            快乐人格卡
          </div>
          {personaQuery.isLoading ? (
            <div className="mt-6">
              <LoadingState title="正在生成你的快乐人格卡" description="请稍等。" />
            </div>
          ) : personaQuery.isError ? (
            <div className="mt-6">
              <ErrorState description="人格卡暂时加载失败。" onRetry={() => personaQuery.refetch()} />
            </div>
          ) : personaQuery.data ? (
            <>
              <h2 className="mt-5 text-[34px] font-semibold tracking-[-0.03em] text-neutral-950">
                {personaQuery.data.archetype_name}
              </h2>
              <p className="mt-3 text-[16px] leading-8 text-neutral-700">
                {personaQuery.data.headline}
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-500">
                {personaQuery.data.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {personaQuery.data.vibe_tags.map((tag) => (
                  <Badge key={tag} tone="blue">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-neutral-500">
                <div className="rounded-[24px] bg-white/70 px-4 py-4">
                  <p>主偏好标签</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    {personaQuery.data.dominant_mood_tag}
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/70 px-4 py-4">
                  <p>最常互动类型</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-950">
                    {personaQuery.data.dominant_product_type}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-panel relative overflow-hidden px-6 py-8 md:col-span-2 md:px-8 md:py-10">
            <div className="absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-accent-pink/30 blur-3xl" />
            <div className="absolute -right-8 top-0 h-36 w-36 rounded-full bg-accent-yellow/40 blur-3xl" />
            <div className="relative z-10">
              <p className="text-base text-neutral-500">Total Balance</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <span className="text-[52px] font-semibold leading-none tracking-[-0.05em] text-neutral-950 md:text-[72px]">
                  {pointsQuery.data?.points_balance ?? profile?.points_balance ?? 0}
                </span>
                <span className="pb-2 text-xl font-semibold text-neutral-600">
                  快乐币 (Joy Coins)
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    if (checkinQuery.data?.checked_in_today || checkinMutation.isPending) return
                    void checkinMutation.mutate()
                  }}
                  disabled={Boolean(checkinQuery.data?.checked_in_today) || checkinMutation.isPending}
                >
                  {checkinQuery.data?.checked_in_today
                    ? '今日已签到'
                    : checkinMutation.isPending
                      ? '签到中…'
                      : '今日签到 +10'}
                </Button>
                <Link to="/me/wallet">
                  <Button variant="secondary">查看快乐流水</Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                {checkinQuery.data?.latest_checkin_date
                  ? `最近签到：${checkinQuery.data.latest_checkin_date}`
                  : '还没有签到记录，今天先收一份快乐补给吧。'}
              </p>
            </div>
          </div>

          <Card className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm text-neutral-500">Published</p>
              <p className="mt-2 text-[40px] font-semibold tracking-[-0.03em] text-neutral-950">
                {headerStats.published}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/45 text-neutral-900">
              <Icon name="plus" />
            </div>
          </Card>

          <Card className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm text-neutral-500">Collected</p>
              <p className="mt-2 text-[40px] font-semibold tracking-[-0.03em] text-neutral-950">
                {headerStats.collected}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple/45 text-neutral-900">
              <Icon name="heart" />
            </div>
          </Card>

          <Card className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm text-neutral-500">Purchased</p>
              <p className="mt-2 text-[40px] font-semibold tracking-[-0.03em] text-neutral-950">
                {headerStats.purchases}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-orange/45 text-neutral-900">
              <Icon name="bag" />
            </div>
          </Card>

          <Card className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm text-neutral-500">Gifts Received</p>
              <p className="mt-2 text-[40px] font-semibold tracking-[-0.03em] text-neutral-950">
                {headerStats.gifts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-900">
              <Icon name="sparkles" />
            </div>
          </Card>
        </div>
      </section>

      {personaQuery.data ? (
        <section className="mb-12 grid gap-4 md:grid-cols-4">
          <Card className="px-5 py-5">
            <p className="text-sm text-neutral-500">快乐行动总数</p>
            <p className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-neutral-950">
              {personaQuery.data.happy_actions}
            </p>
          </Card>
          <Card className="px-5 py-5">
            <p className="text-sm text-neutral-500">买下的快乐</p>
            <p className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-neutral-950">
              {personaQuery.data.purchases_count}
            </p>
          </Card>
          <Card className="px-5 py-5">
            <p className="text-sm text-neutral-500">送出的快乐</p>
            <p className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-neutral-950">
              {personaQuery.data.gifts_sent_count}
            </p>
          </Card>
          <Card className="px-5 py-5">
            <p className="text-sm text-neutral-500">收到的礼物</p>
            <p className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-neutral-950">
              {personaQuery.data.gifts_received_count}
            </p>
          </Card>
        </section>
      ) : null}

      <section className="mb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-neutral-950">
            Recent Joy Flow
          </h2>
          <Link to="/me/wallet" className="text-sm text-neutral-500 transition hover:text-neutral-900">
            View All
          </Link>
        </div>

        {pointsQuery.isLoading ? (
          <LoadingState title="正在加载快乐流水" description="请稍等。" />
        ) : pointsQuery.isError ? (
          <ErrorState description="快乐流水加载失败。" onRetry={() => pointsQuery.refetch()} />
        ) : (
          <Card className="overflow-hidden">
            {pointsQuery.data?.point_transactions.length ? (
              pointsQuery.data.point_transactions.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between gap-4 px-6 py-5',
                    index < 2 && 'border-b border-black/6',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                      <Icon name={transactionIconMap[item.transaction_type] ?? 'plus'} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{item.description ?? item.transaction_type}</p>
                      <p className="mt-1 text-sm text-neutral-500">{formatDateTime(item.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-lg font-semibold',
                      item.amount >= 0 ? 'text-neutral-950' : 'text-neutral-500',
                    )}
                  >
                    {item.amount >= 0 ? '+' : ''}
                    {item.amount} Joy
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-sm text-neutral-500">
                暂时还没有快乐流水记录。
              </div>
            )}
          </Card>
        )}
      </section>

      <section>
        <div className="hide-scrollbar mb-6 flex gap-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={cn(
                'rounded-full px-5 py-3 text-sm font-medium whitespace-nowrap transition duration-200',
                activeTab === tab.key
                  ? 'bg-neutral-950 text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)]'
                  : 'border border-black/8 bg-white/84 text-neutral-600',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'published' ? (
          productsQuery.isLoading ? (
            <LoadingState title="正在加载发布记录" description="请稍等。" />
          ) : productsQuery.isError ? (
            <ErrorState description="发布记录加载失败。" onRetry={() => productsQuery.refetch()} />
          ) : productsQuery.data?.items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {productsQuery.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title="你还没有发布快乐" description="先上架第一份今日小确幸吧。" />
          )
        ) : null}

        {activeTab === 'purchases' ? (
          purchasesQuery.isLoading ? (
            <LoadingState title="正在加载购买记录" description="请稍等。" />
          ) : purchasesQuery.isError ? (
            <ErrorState description="购买记录加载失败。" onRetry={() => purchasesQuery.refetch()} />
          ) : purchasesQuery.data?.items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {purchasesQuery.data.items.map((item) => (
                <div key={`${item.product.id}-${item.purchased_at}`}>
                  <ProductCard product={item.product} />
                  <p className="mt-3 pl-2 text-sm text-neutral-500">
                    购入于 {formatDateTime(item.purchased_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="你还没有买下任何快乐"
              description="去市场挑一份刚好适合今天的快乐吧。"
            />
          )
        ) : null}

        {activeTab === 'collections' ? (
          collectionsQuery.isLoading ? (
            <LoadingState title="正在加载收藏记录" description="请稍等。" />
          ) : collectionsQuery.isError ? (
            <ErrorState description="收藏记录加载失败。" onRetry={() => collectionsQuery.refetch()} />
          ) : collectionsQuery.data?.items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {collectionsQuery.data.items.map((item) => (
                <div key={`${item.product.id}-${item.collected_at}`}>
                  <ProductCard product={item.product} />
                  <p className="mt-3 pl-2 text-sm text-neutral-500">
                    收藏于 {formatDateTime(item.collected_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="还没有收藏快乐"
              description="看到喜欢的内容时，记得把它留进自己的快乐仓库。"
            />
          )
        ) : null}

        {activeTab === 'gifts' ? (
          giftsQuery.isLoading ? (
            <LoadingState title="正在加载快乐礼物" description="请稍等。" />
          ) : giftsQuery.isError ? (
            <ErrorState description="快乐礼物加载失败。" onRetry={() => giftsQuery.refetch()} />
          ) : giftsQuery.data?.items.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {giftsQuery.data.items.map((gift) => (
                <div key={gift.id} className="space-y-3">
                  <ProductCard product={gift.product} ctaLabel="查看礼物" />
                  <Card className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {resolveAssetUrl(gift.sender.avatar_url) ? (
                        <img
                          src={resolveAssetUrl(gift.sender.avatar_url) ?? ''}
                          alt={gift.sender.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-pink/30 text-sm font-semibold text-neutral-700">
                          {getInitial(gift.sender.username)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">来自匿名快乐传递者</p>
                        <p className="mt-1 text-xs text-neutral-400">系统记录发送者：{gift.sender.username}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-neutral-500">
                      {gift.message ?? '有人把这份快乐继续传给了你。'}
                    </p>
                    <p className="mt-3 text-xs text-neutral-400">
                      收到于 {formatDateTime(gift.created_at)}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="还没有收到快乐礼物"
              description="当别人把快乐继续送下去时，这里会收到惊喜。"
            />
          )
        ) : null}

        {activeTab === 'points' ? (
          pointsQuery.isLoading ? (
            <LoadingState title="正在加载快乐流水" description="请稍等。" />
          ) : pointsQuery.isError ? (
            <ErrorState description="快乐流水加载失败。" onRetry={() => pointsQuery.refetch()} />
          ) : pointsQuery.data?.point_transactions.length ? (
            <Card className="overflow-hidden">
              {pointsQuery.data.point_transactions.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between',
                    index < pointsQuery.data.point_transactions.length - 1 && 'border-b border-black/6',
                  )}
                >
                  <div>
                    <p className="font-medium text-neutral-900">{item.description ?? item.transaction_type}</p>
                    <p className="mt-1 text-sm text-neutral-500">{formatDateTime(item.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        item.amount >= 0 ? 'text-neutral-950' : 'text-neutral-500',
                      )}
                    >
                      {item.amount >= 0 ? '+' : ''}
                      {item.amount} Joy
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">余额 {item.balance_after}</p>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState
              title="还没有快乐流水"
              description="完成签到、发布或购买后，这里会留下你的快乐流动记录。"
            />
          )
        ) : null}
      </section>
    </PageContainer>
  )
}
