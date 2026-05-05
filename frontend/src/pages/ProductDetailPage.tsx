import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { PageContainer } from '../components/ui/PageContainer'
import { currentUserQueryKey } from '../features/auth/hooks'
import { productsApi } from '../features/products/api'
import { resolveAssetUrl } from '../lib/assets'
import { ApiError } from '../lib/api-client'
import { getMoodTone } from '../lib/content'
import { formatRelativeTime } from '../lib/format'
import { queryClient } from '../lib/query-client'
import { useAuthStore } from '../stores/auth-store'

export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [giftMessage, setGiftMessage] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductDetail(productId),
    enabled: Boolean(productId),
  })

  const commentsQuery = useQuery({
    queryKey: ['product-comments', productId],
    queryFn: () => productsApi.getComments(productId, 1, 20),
    enabled: Boolean(productId),
  })

  useEffect(() => {
    if (!detailQuery.data) return
    const mainImage = resolveAssetUrl(
      detailQuery.data.images[0]?.image_url ?? detailQuery.data.cover_image_url,
    )
    setSelectedImage(mainImage)
  }, [detailQuery.data])

  function ensureAuthed() {
    if (!token) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
      return false
    }
    return true
  }

  function refreshAll() {
    void queryClient.invalidateQueries({ queryKey: ['product', productId] })
    void queryClient.invalidateQueries({ queryKey: ['product-comments', productId] })
    void queryClient.invalidateQueries({ queryKey: ['market'] })
    void queryClient.invalidateQueries({ queryKey: ['home'] })
    void queryClient.invalidateQueries({ queryKey: ['me'] })
    void queryClient.invalidateQueries({ queryKey: ['me', 'gifts'] })
    void queryClient.invalidateQueries({ queryKey: ['me', 'persona'] })
    void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
  }

  const purchaseMutation = useMutation({
    mutationFn: () => productsApi.purchaseProduct(productId),
    onSuccess: () => {
      setGiftMessage(null)
      setActionError(null)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '购买失败，请稍后再试。'),
  })

  const giftMutation = useMutation({
    mutationFn: () => productsApi.giftProduct(productId),
    onSuccess: (data) => {
      setActionError(null)
      setGiftMessage(data.message)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '送出失败，请稍后再试。'),
  })

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!detailQuery.data) return
      if (detailQuery.data.state.is_liked) return productsApi.unlikeProduct(productId)
      return productsApi.likeProduct(productId)
    },
    onSuccess: () => {
      setActionError(null)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '操作失败，请稍后再试。'),
  })

  const collectMutation = useMutation({
    mutationFn: async () => {
      if (!detailQuery.data) return
      if (detailQuery.data.state.is_collected) return productsApi.uncollectProduct(productId)
      return productsApi.collectProduct(productId)
    },
    onSuccess: () => {
      setActionError(null)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '操作失败，请稍后再试。'),
  })

  const commentMutation = useMutation({
    mutationFn: () => productsApi.createComment(productId, commentText.trim()),
    onSuccess: () => {
      setCommentText('')
      setActionError(null)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '评论失败，请稍后再试。'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => productsApi.deleteComment(commentId),
    onSuccess: () => {
      setActionError(null)
      refreshAll()
    },
    onError: (error) =>
      setActionError(error instanceof ApiError ? error.detail : '删除评论失败，请稍后再试。'),
  })

  const detail = detailQuery.data
  const authorAvatarUrl = resolveAssetUrl(detail?.author.avatar_url)
  const unlocked = Boolean(detail?.state.is_accessible)
  const description = useMemo(() => {
    if (!detail) return ''
    if (unlocked) return detail.description
    if (detail.description.length <= 80) return detail.description
    return `${detail.description.slice(0, 80).trim()}……`
  }, [detail, unlocked])

  if (detailQuery.isLoading) {
    return (
      <PageContainer className="py-10 md:py-16">
        <LoadingState title="正在展开这份快乐" description="请稍等。" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !detail) {
    return (
      <PageContainer className="py-10 md:py-16">
        <ErrorState description="商品详情暂时无法加载。" onRetry={() => detailQuery.refetch()} />
      </PageContainer>
    )
  }

  const gallery =
    detail.images.length
      ? detail.images
      : detail.cover_image_url
        ? [{ id: -1, image_url: detail.cover_image_url, sort_order: 0 }]
        : []

  const pending =
    purchaseMutation.isPending ||
    giftMutation.isPending ||
    likeMutation.isPending ||
    collectMutation.isPending ||
    commentMutation.isPending ||
    deleteCommentMutation.isPending

  return (
    <PageContainer className="py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-14">
        <section>
          <div className="overflow-hidden rounded-[36px] bg-white shadow-[0_12px_40px_rgba(17,24,39,0.05)]">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={detail.title}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            ) : (
              <div className="hero-surface aspect-[4/3]" />
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-4">
              {gallery.slice(0, 4).map((image) => {
                const imageUrl = resolveAssetUrl(image.image_url)
                const active = selectedImage === imageUrl
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`overflow-hidden rounded-[22px] border-2 transition ${
                      active
                        ? 'border-neutral-950'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={detail.title}
                        className="h-20 w-20 object-cover md:h-24 md:w-24"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        <section>
          <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.04em] text-neutral-950 md:text-[60px]">
            {detail.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.mood_tags.map((tag) => (
              <Badge key={tag} tone={getMoodTone(tag) as never}>
                {tag}
              </Badge>
            ))}
          </div>

          <Card className="mt-8 flex items-center gap-4 px-5 py-4">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={detail.author.username}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-pink/30 text-base font-semibold text-neutral-700">
                {detail.author.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-neutral-900">{detail.author.username}</p>
              <p className="mt-1 text-sm text-neutral-500">发布于 {formatRelativeTime(detail.created_at)}</p>
            </div>
            <Button variant="secondary" className="ml-auto h-10 px-5 text-xs">
              关注
            </Button>
          </Card>

          <Card className="mt-6 px-6 py-6 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-base text-neutral-500">获取这份快乐需要</p>
              <div className="flex items-center gap-2 text-neutral-950">
                <Icon name="coin" className="h-5 w-5 text-accent-orange" />
                <span className="text-[28px] font-semibold tracking-[-0.03em]">
                  {detail.price} 快乐币
                </span>
              </div>
            </div>

            <Button
              fullWidth
              className="mt-6"
              disabled={
                pending ||
                (token ? detail.state.is_author || detail.state.is_accessible || !detail.state.can_purchase : false)
              }
              onClick={() => {
                if (!ensureAuthed()) return
                void purchaseMutation.mutate()
              }}
            >
              {!token
                ? '登录后买下这份快乐'
                : detail.state.is_author
                  ? '这是你发布的快乐'
                  : detail.state.is_accessible
                    ? detail.state.is_gifted
                      ? '这份快乐是你收到的礼物'
                      : '你已经拥有这份快乐'
                    : '买下这份快乐'}
            </Button>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  if (!ensureAuthed()) return
                  void likeMutation.mutate()
                }}
                iconLeft={<Icon name="heart" className="h-4 w-4" />}
              >
                {detail.state.is_liked ? '已被治愈' : '被治愈了'}
              </Button>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  if (!ensureAuthed()) return
                  void collectMutation.mutate()
                }}
                iconLeft={<Icon name="bookmark" className="h-4 w-4" />}
              >
                {detail.state.is_collected ? '已收藏' : '收藏这份快乐'}
              </Button>
            </div>
            {actionError ? <p className="mt-4 text-sm text-rose-500">{actionError}</p> : null}
          </Card>

          {detail.state.can_gift ? (
            <Card className="mt-6 border-accent-blue/25 bg-gradient-to-br from-white to-sky-50/60 px-6 py-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">一键送出快乐</p>
                  <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-neutral-950">
                    把这份快乐匿名送给下一位陌生人
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-500">
                    你已经拥有这份内容，现在可以让它继续流通，去照顾另一个今天刚好需要的人。
                  </p>
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-neutral-600">
                  匿名传递
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  disabled={giftMutation.isPending}
                  onClick={() => {
                    if (!ensureAuthed()) return
                    void giftMutation.mutate()
                  }}
                >
                  {giftMutation.isPending ? '送出中…' : '匿名送出这份快乐'}
                </Button>
                <p className="self-center text-sm text-neutral-500">
                  不会消耗额外快乐币，只会把补给继续传下去。
                </p>
              </div>
              {giftMessage ? <p className="mt-4 text-sm text-emerald-600">{giftMessage}</p> : null}
            </Card>
          ) : null}

          <div className="mt-8">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-neutral-950">
              快乐背后的故事
            </h2>
            <p className="mt-4 text-[15px] leading-8 text-neutral-600">{description}</p>
          </div>

          {!unlocked ? (
            <div className="mt-8 rounded-[30px] border border-accent-orange/30 bg-gradient-to-br from-white to-orange-50/70 px-6 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-orange/20 text-accent-orange">
                <Icon name="lock" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-950">解锁完整快乐内容</h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-neutral-500">
                购买后即可查看完整故事、全部图片，以及作者留下的更多温柔细节。
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-16 border-t border-black/6 pt-12 md:mt-20 md:pt-14">
        <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-neutral-950">
          共鸣角落 ({detail.comment_count})
        </h2>

        <div className="mt-8 max-w-3xl">
          <Card className="px-5 py-5">
            <Input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={token ? '写下你的感受，让这份快乐继续流动。' : '登录后可以发表评论。'}
              disabled={!token || !detail.state.can_comment || commentMutation.isPending}
              className="h-14 rounded-[20px]"
              icon={<Icon name="comment" className="h-4 w-4" />}
            />
            <div className="mt-4 flex justify-end">
              <Button
                disabled={
                  !commentText.trim() ||
                  !token ||
                  !detail.state.can_comment ||
                  commentMutation.isPending
                }
                onClick={() => {
                  if (!ensureAuthed()) return
                  void commentMutation.mutate()
                }}
              >
                {commentMutation.isPending ? '发送中…' : '发表评论'}
              </Button>
            </div>
          </Card>

          <div className="mt-8 space-y-8">
            {commentsQuery.isLoading ? <LoadingState title="正在加载评论" description="请稍等。" /> : null}
            {commentsQuery.isError ? (
              <ErrorState description="评论列表加载失败。" onRetry={() => commentsQuery.refetch()} />
            ) : null}
            {commentsQuery.data?.items.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                {resolveAssetUrl(comment.user.avatar_url) ? (
                  <img
                    src={resolveAssetUrl(comment.user.avatar_url) ?? ''}
                    alt={comment.user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-pink/30 text-sm font-semibold text-neutral-700">
                    {comment.user.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900">
                      {comment.user.username}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    {comment.is_mine ? (
                      <button
                        type="button"
                        className="text-xs text-neutral-400 transition hover:text-rose-500"
                        onClick={() => {
                          void deleteCommentMutation.mutate(comment.id)
                        }}
                      >
                        删除
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[15px] leading-7 text-neutral-600">{comment.content}</p>
                </div>
              </div>
            ))}
            {commentsQuery.data && commentsQuery.data.items.length === 0 ? (
              <Card className="px-6 py-10 text-center text-sm text-neutral-500">
                还没有评论，来留下第一句共鸣吧。
              </Card>
            ) : null}
          </div>
        </div>

        <div className="mt-10">
          <Link to="/market" className="text-sm text-neutral-500 transition hover:text-neutral-950">
            返回市场继续看看 →
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}
