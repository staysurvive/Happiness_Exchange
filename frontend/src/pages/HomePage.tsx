import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { checkinsApi } from '../features/checkins/api'
import { productsApi } from '../features/products/api'
import { currentUserQueryKey } from '../features/auth/hooks'
import { MOOD_NEED_OPTIONS, MOOD_TAG_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../lib/content'
import { queryClient } from '../lib/query-client'
import { useAuthStore } from '../stores/auth-store'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/ui/PageContainer'
import { ProductCard } from '../components/ui/ProductCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import type { MoodNeed } from '../types/api'

export function HomePage() {
  const token = useAuthStore((state) => state.token)
  const [selectedNeed, setSelectedNeed] = useState<MoodNeed>('healing')

  const featuredQuery = useQuery({
    queryKey: ['home', 'featured'],
    queryFn: () => productsApi.getProducts({ sort: 'popular', page_size: 3 }),
  })
  const latestQuery = useQuery({
    queryKey: ['home', 'latest'],
    queryFn: () => productsApi.getProducts({ sort: 'latest', page_size: 6 }),
  })
  const recommendationQuery = useQuery({
    queryKey: ['home', 'mood-recommendation', selectedNeed],
    queryFn: () => productsApi.getMoodRecommendations(selectedNeed),
  })
  const checkinQuery = useQuery({
    queryKey: ['home', 'checkin'],
    queryFn: checkinsApi.getStatus,
    enabled: Boolean(token),
  })

  const checkinMutation = useMutation({
    mutationFn: checkinsApi.checkIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['home', 'checkin'] })
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })

  const selectedMoodMeta = useMemo(
    () => MOOD_NEED_OPTIONS.find((item) => item.value === selectedNeed) ?? MOOD_NEED_OPTIONS[1],
    [selectedNeed],
  )

  return (
    <main>
      <section className="hero-surface relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_45%)]" />
        <PageContainer className="relative flex min-h-[72vh] items-center justify-center py-16 text-center md:min-h-[860px] md:py-20">
          <div className="flex max-w-5xl -translate-y-6 flex-col items-center text-center md:-translate-y-10">
            <div className="pill mb-6 gap-2 md:mb-7">
              <Icon name="sparkles" className="h-4 w-4 text-accent-orange" />
              <span>每日情绪补给站</span>
            </div>
            <h1 className="display-title max-w-4xl text-balance">让快乐流通起来。</h1>
            <p className="mx-auto mt-5 max-w-[920px] text-[20px] leading-9 tracking-[-0.02em] text-neutral-500 md:mt-6 md:text-[28px] md:leading-[1.4]">
              把今天的小确幸，变成别人的情绪补给。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center md:mt-11">
              <Link to="/market">
                <Button className="min-w-[180px]">去市场看看</Button>
              </Link>
              <Link to={token ? '/publish' : '/login'}>
                <Button variant="secondary" className="min-w-[180px]">
                  发布我的快乐
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-20 md:py-24">
        <PageContainer>
          <SectionHeader
            title="今天你想收到哪种快乐？"
            description="先选一个当下心情，我们马上给你一份更合适的补给。"
          />
          <div className="mt-8 hide-scrollbar flex gap-3 overflow-x-auto pb-2 md:flex-wrap">
            {MOOD_NEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedNeed(option.value)}
                className={`rounded-full px-5 py-3 text-left transition ${
                  selectedNeed === option.value
                    ? 'bg-neutral-950 text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)]'
                    : 'border border-black/8 bg-white/84 text-neutral-700'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span
                  className={`mt-1 block text-xs ${
                    selectedNeed === option.value ? 'text-white/70' : 'text-neutral-400'
                  }`}
                >
                  {option.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="glass-panel px-6 py-7 md:px-8 md:py-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600">
                <Icon name="sparkles" className="h-4 w-4 text-accent-orange" />
                今日情绪推荐
              </div>
              <h3 className="mt-5 text-[30px] font-semibold tracking-[-0.03em] text-neutral-950 md:text-[38px]">
                {recommendationQuery.data?.title ?? `适合${selectedMoodMeta.label}的快乐`}
              </h3>
              <p className="body-muted mt-4">
                {recommendationQuery.data?.description ?? '我们正在整理更适合当下心情的快乐补给。'}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(recommendationQuery.data?.recommended_tags ?? []).map((tag) => (
                  <Badge key={tag} tone="blue">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={`/market?mood_tag=${
                    recommendationQuery.data?.recommended_tags?.[0] ?? MOOD_TAG_OPTIONS[0]
                  }`}
                >
                  <Button>去看这类快乐</Button>
                </Link>
                <Link to="/market">
                  <Button variant="secondary">浏览全部市场</Button>
                </Link>
              </div>
            </div>

            <div>
              {recommendationQuery.isLoading ? (
                <LoadingState title="正在挑选适合今天的快乐" description="请稍等。" />
              ) : recommendationQuery.isError ? (
                <ErrorState
                  description="今日心情推荐暂时加载失败。"
                  onRetry={() => recommendationQuery.refetch()}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {recommendationQuery.data?.items.slice(0, 3).map((product) => (
                    <ProductCard key={product.id} product={product} ctaLabel="收下这份快乐" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-20 md:py-28">
        <PageContainer>
          <SectionHeader title="今日快乐补给" description="来自世界各地的治愈瞬间" />
          <div className="mt-10">
            {featuredQuery.isLoading ? (
              <LoadingState title="正在准备今日补给" description="请稍等，马上呈上。" />
            ) : featuredQuery.isError ? (
              <ErrorState
                description="今日补给暂时加载失败。"
                onRetry={() => featuredQuery.refetch()}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {featuredQuery.data?.items.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </section>

      <section className="pb-20 md:pb-28">
        <PageContainer className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="px-6 py-8 md:px-8 md:py-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-neutral-950 md:text-[36px]">
                  快乐流通中
                </h2>
                <p className="body-muted mt-3">先从今天最想看到的情绪类型开始。</p>
              </div>
              <Link to="/market">
                <Button variant="secondary" iconRight={<Icon name="arrow-right" className="h-4 w-4" />}>
                  去逛逛
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {PRODUCT_TYPE_OPTIONS.slice(0, 7).map((item) => (
                <Link key={item.value} to={`/market?type=${item.value}`}>
                  <Badge tone="neutral" className="px-4 py-2 text-xs font-medium">
                    {item.shortLabel}
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {MOOD_TAG_OPTIONS.slice(0, 6).map((tag) => (
                <Link key={tag} to={`/market?mood_tag=${tag}`}>
                  <Badge tone="blue">#{tag}</Badge>
                </Link>
              ))}
            </div>
          </Card>

          <div className="glass-panel px-6 py-8 md:px-8 md:py-10">
            <div className="flex items-center gap-3 text-neutral-700">
              <Icon name="calendar" className="h-5 w-5" />
              <span className="text-sm font-medium">今日快乐补给</span>
            </div>
            <h3 className="mt-5 text-[28px] font-semibold tracking-[-0.02em] text-neutral-950">
              {token ? '签到收下 10 快乐币' : '登录后领取今日签到奖励'}
            </h3>
            <p className="body-muted mt-3">
              {token
                ? checkinQuery.data?.checked_in_today
                  ? `今天已经签过到了，最近签到日期：${checkinQuery.data.latest_checkin_date ?? '今天'}`
                  : '今天先收一份补给，再去看看大家分享的治愈瞬间。'
                : '登录后即可开启快乐流通路径，签到、购买、收藏、送出快乐都会被记录。'}
            </p>
            <div className="mt-8">
              {token ? (
                <Button
                  disabled={Boolean(checkinQuery.data?.checked_in_today) || checkinMutation.isPending}
                  onClick={() => {
                    void checkinMutation.mutate()
                  }}
                >
                  {checkinQuery.data?.checked_in_today
                    ? '今天已签到'
                    : checkinMutation.isPending
                      ? '签到中…'
                      : '立即签到'}
                </Button>
              ) : (
                <Link to="/login">
                  <Button>去登录</Button>
                </Link>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pb-24 md:pb-32">
        <PageContainer>
          <SectionHeader
            title="最新上架"
            description="新的快乐正在加入流通，也许刚好适合今天的你。"
          />
          <div className="mt-10">
            {latestQuery.isLoading ? (
              <LoadingState title="正在更新最新内容" description="请稍等。" />
            ) : latestQuery.isError ? (
              <ErrorState
                description="最新上架内容加载失败。"
                onRetry={() => latestQuery.refetch()}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {latestQuery.data?.items.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </section>
    </main>
  )
}
