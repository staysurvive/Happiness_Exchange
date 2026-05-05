import { Link } from 'react-router-dom'
import { resolveAssetUrl } from '../../lib/assets'
import { cn } from '../../lib/cn'
import { buildProductTeaser, getMoodTone, getProductTypeMeta } from '../../lib/content'
import { formatCompactNumber } from '../../lib/format'
import type { ProductSummary } from '../../types/api'
import { Badge } from './Badge'
import { Button } from './Button'
import { Icon } from './Icon'

type Props = {
  product: ProductSummary
  className?: string
  ctaLabel?: string
}

export function ProductCard({ product, className, ctaLabel = '获取快乐' }: Props) {
  const imageUrl = resolveAssetUrl(product.cover_image_url)
  const authorAvatarUrl = resolveAssetUrl(product.author.avatar_url)
  const typeMeta = getProductTypeMeta(product.product_type)
  const teaser = buildProductTeaser(product)

  return (
    <article className={cn('product-card-shell group soft-card soft-card-hover flex h-full flex-col overflow-hidden', className)}>
      <Link to={`/products/${product.id}`} className="block">
        <div
          className={cn(
            'relative flex h-64 w-full items-center justify-center overflow-hidden',
            typeMeta.gradientClass,
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : product.product_type === 'encouragement' ? (
            <div className="px-8 text-center text-neutral-700">
              <Icon name="quote" className="mx-auto mb-4 h-8 w-8 text-accent-blue" />
              <p className="text-lg font-semibold leading-8">“允许一切发生，然后享受今天的一杯咖啡。”</p>
            </div>
          ) : (
            <div className="px-8 text-center text-neutral-500">
              <p className="text-sm font-medium">这份快乐暂时还没上传封面</p>
            </div>
          )}

          <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/84 px-3 py-1 text-[12px] font-medium text-neutral-700 backdrop-blur-xl">
            <Icon name="coin" className="h-4 w-4 text-accent-orange" />
            <span>{product.price} 快乐币</span>
          </div>
        </div>
      </Link>

      <div className={cn('flex flex-1 flex-col p-5 md:p-6', typeMeta.gradientClass)}>
        <div className="mb-3 flex flex-wrap gap-2">
          {product.mood_tags.slice(0, 2).map((tag) => (
            <Badge key={tag} tone={getMoodTone(tag) as never}>
              {tag}
            </Badge>
          ))}
          {product.mood_tags.length === 0 ? <Badge tone="neutral">{typeMeta.shortLabel}</Badge> : null}
        </div>

        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-[18px] font-semibold leading-8 tracking-[-0.02em] text-neutral-950 md:text-[20px]">
            {product.title}
          </h3>
          <p className="mt-2 text-[14px] leading-6 text-neutral-600">{teaser}</p>
        </Link>

        <div className="mt-auto pt-5">
          <div className="mb-4 h-px bg-black/8" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={product.author.username}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-black/6"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-pink/30 text-xs font-semibold text-neutral-700">
                  {product.author.username.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-neutral-800">
                  {product.author.username}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[12px] text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="heart" className="h-3.5 w-3.5" />
                    {formatCompactNumber(product.like_count)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="bag" className="h-3.5 w-3.5" />
                    {formatCompactNumber(product.purchase_count)}
                  </span>
                </div>
              </div>
            </div>
            <Link to={`/products/${product.id}`}>
              <Button className="h-10 px-4 text-xs">{ctaLabel}</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
