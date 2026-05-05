import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { PageContainer } from '../components/ui/PageContainer'
import { ProductCard } from '../components/ui/ProductCard'
import { MOOD_TAG_OPTIONS, PRODUCT_TYPE_OPTIONS, SORT_OPTIONS } from '../lib/content'
import { productsApi } from '../features/products/api'

export function MarketPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      type: searchParams.get('type') ?? '',
      mood_tag: searchParams.get('mood_tag') ?? '',
      sort: searchParams.get('sort') ?? 'latest',
      min_price: searchParams.get('min_price') ?? '',
      max_price: searchParams.get('max_price') ?? '',
      page: Number(searchParams.get('page') ?? '1'),
      page_size: 9,
    }),
    [searchParams],
  )

  const marketQuery = useQuery({
    queryKey: ['market', filters],
    queryFn: () =>
      productsApi.getProducts({
        ...filters,
        type: filters.type || undefined,
        mood_tag: filters.mood_tag || undefined,
        min_price: filters.min_price ? Number(filters.min_price) : undefined,
        max_price: filters.max_price ? Number(filters.max_price) : undefined,
      }),
  })

  function updateParams(next: Record<string, string | number | null>) {
    const draft = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value === null || value === '') {
        draft.delete(key)
      } else {
        draft.set(key, String(value))
      }
    })
    if (!('page' in next)) draft.set('page', '1')
    setSearchParams(draft)
  }

  const totalPages = marketQuery.data ? Math.max(1, Math.ceil(marketQuery.data.total / marketQuery.data.page_size)) : 1

  return (
    <PageContainer className="py-10 md:py-16">
      <section className="mb-10 md:mb-12">
        <h1 className="page-title">今日快乐市场</h1>
        <p className="mt-4 text-[22px] leading-9 tracking-[-0.02em] text-neutral-500 md:text-[30px] md:leading-[1.45]">
          选择一份刚好适合今天的快乐。
        </p>
      </section>

      <section className="mb-6 hide-scrollbar overflow-x-auto pb-3">
        <div className="flex w-max gap-3 md:flex-wrap md:w-auto">
          <button
            type="button"
            onClick={() => updateParams({ type: '', page: 1 })}
            className={`rounded-full px-6 py-3 text-sm font-medium transition ${filters.type === '' ? 'bg-neutral-950 text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)]' : 'border border-black/8 bg-white/84 text-neutral-600'}`}
          >
            全部
          </button>
          {PRODUCT_TYPE_OPTIONS.slice(1, 7).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => updateParams({ type: item.value, page: 1 })}
              className={`rounded-full px-6 py-3 text-sm font-medium transition ${filters.type === item.value ? 'bg-neutral-950 text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)]' : 'border border-black/8 bg-white/84 text-neutral-600'}`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-4 rounded-[32px] border border-white/70 bg-white/70 p-5 backdrop-blur-2xl md:grid-cols-[1.4fr_1fr_1fr] md:p-6">
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-500">情绪标签</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 md:flex-wrap">
            <button
              type="button"
              onClick={() => updateParams({ mood_tag: '' })}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${filters.mood_tag === '' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500'}`}
            >
              全部标签
            </button>
            {MOOD_TAG_OPTIONS.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => updateParams({ mood_tag: tag })}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${filters.mood_tag === tag ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-neutral-500">价格范围</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={0}
              value={filters.min_price}
              onChange={(event) => updateParams({ min_price: event.target.value })}
              placeholder="最低价"
              className="h-12 rounded-full bg-white"
              icon={<Icon name="coin" className="h-4 w-4 text-accent-orange" />}
            />
            <Input
              type="number"
              min={0}
              value={filters.max_price}
              onChange={(event) => updateParams({ max_price: event.target.value })}
              placeholder="最高价"
              className="h-12 rounded-full bg-white"
              icon={<Icon name="coin" className="h-4 w-4 text-accent-orange" />}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-neutral-500">排序方式</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 md:flex-wrap">
            {SORT_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => updateParams({ sort: item.value })}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${filters.sort === item.value ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {marketQuery.isLoading ? <LoadingState title="正在加载市场内容" description="请稍等。" /> : null}
      {marketQuery.isError ? <ErrorState description="市场内容加载失败。" onRetry={() => marketQuery.refetch()} /> : null}
      {marketQuery.data && marketQuery.data.total === 0 ? (
        <EmptyState title="暂时没有匹配的快乐" description="换个标签或价格范围试试看。" />
      ) : null}

      {marketQuery.data && marketQuery.data.total > 0 ? (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {marketQuery.data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              第 {filters.page} 页 / 共 {totalPages} 页，共 {marketQuery.data.total} 份快乐在流通中
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                disabled={filters.page <= 1}
                onClick={() => updateParams({ page: filters.page - 1 })}
              >
                上一页
              </Button>
              <Button
                variant="secondary"
                disabled={filters.page >= totalPages}
                onClick={() => updateParams({ page: filters.page + 1 })}
              >
                下一页
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </PageContainer>
  )
}
