import { useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { ErrorState } from '../components/feedback/ErrorState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { PageContainer } from '../components/ui/PageContainer'
import { Textarea } from '../components/ui/Textarea'
import { currentUserQueryKey } from '../features/auth/hooks'
import { productsApi } from '../features/products/api'
import { uploadsApi } from '../features/uploads/api'
import { MOOD_TAG_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../lib/content'
import { ApiError } from '../lib/api-client'
import { queryClient } from '../lib/query-client'
import type { ProductType } from '../types/api'

type UploadItem = {
  id: string
  file: File
  preview: string
}

export function PublishPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [productType, setProductType] = useState<ProductType>('happy_moment')
  const [moodTags, setMoodTags] = useState<string[]>(['治愈'])
  const [customTag, setCustomTag] = useState('')
  const [price, setPrice] = useState('10')
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('请先给这份快乐起一个名字。')
      if (!description.trim()) throw new Error('请补充一下这份快乐背后的故事。')
      const numericPrice = Number(price)
      if (!Number.isFinite(numericPrice) || numericPrice < 0) throw new Error('请输入有效价格。')
      if (uploads.length > 9) throw new Error('图片最多 9 张。')

      const imageUrls: string[] = []
      for (const item of uploads) {
        const response = await uploadsApi.uploadImage(item.file)
        imageUrls.push(response.image_url)
      }

      return productsApi.createProduct({
        title: title.trim(),
        description: description.trim(),
        product_type: productType,
        mood_tags: moodTags,
        price: numericPrice,
        image_urls: imageUrls,
      })
    },
    onSuccess: (data) => {
      setFormError(null)
      void queryClient.invalidateQueries({ queryKey: ['home'] })
      void queryClient.invalidateQueries({ queryKey: ['market'] })
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
      navigate(`/products/${data.id}`)
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.detail : error instanceof Error ? error.message : '发布失败，请稍后再试。')
    },
  })

  const selectedType = useMemo(() => PRODUCT_TYPE_OPTIONS.find((item) => item.value === productType), [productType])

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const next: UploadItem[] = []
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setFormError('图片仅支持 JPG、PNG、WEBP。')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('单张图片不能超过 5MB。')
        continue
      }
      next.push({ id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, file, preview: URL.createObjectURL(file) })
    }

    setUploads((current) => [...current, ...next].slice(0, 9))
    event.target.value = ''
  }

  function toggleMoodTag(tag: string) {
    setMoodTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag].slice(0, 6)))
  }

  function addCustomTag() {
    const tag = customTag.trim()
    if (!tag) return
    if (!moodTags.includes(tag)) {
      setMoodTags((current) => [...current, tag].slice(0, 6))
    }
    setCustomTag('')
  }

  return (
    <PageContainer className="py-10 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="page-title">发布一份快乐</h1>
        <p className="body-muted mt-4">把今天的小小开心，变成别人的情绪补给。</p>
      </div>

      <Card className="mx-auto mt-14 max-w-3xl px-5 py-6 md:px-8 md:py-8">
        <div>
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-neutral-950">美好瞬间</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {uploads.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-[24px] bg-neutral-100">
                <img src={item.preview} alt={item.file.name} className="aspect-square h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-black/55 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  onClick={() => {
                    URL.revokeObjectURL(item.preview)
                    setUploads((current) => current.filter((upload) => upload.id !== item.id))
                  }}
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
            {uploads.length < 9 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-black/10 bg-neutral-50 text-neutral-400 transition hover:bg-white"
              >
                <Icon name="image" className="mb-3 h-8 w-8" />
                <span className="text-sm font-medium">添加图片</span>
              </button>
            ) : null}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-neutral-950">这份快乐叫什么？</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：今天路边遇到了一只超亲人的小猫" />
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-neutral-950">快乐类型</label>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 md:flex-wrap">
            {PRODUCT_TYPE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setProductType(item.value)}
                className={`rounded-full px-5 py-3 text-sm font-medium transition ${productType === item.value ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600'}`}
              >
                {item.shortLabel}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-neutral-500">当前选择：{selectedType?.label}</p>
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-neutral-950">情绪标签</label>
          <div className="flex flex-wrap gap-3">
            {MOOD_TAG_OPTIONS.map((tag, index) => {
              const tones = ['yellow', 'green', 'pink', 'blue'] as const
              return (
                <button key={tag} type="button" onClick={() => toggleMoodTag(tag)}>
                  <Badge tone={tones[index % tones.length]} className={`px-5 py-2 text-xs ${moodTags.includes(tag) ? 'ring-2 ring-black/10' : 'opacity-80'}`}>
                    # {tag}
                  </Badge>
                </button>
              )
            })}
            <div className="flex items-center gap-2 rounded-full border border-black/8 bg-neutral-50 px-3 py-2">
              <Input
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addCustomTag()
                  }
                }}
                placeholder="自定义"
                className="h-8 rounded-full border-0 bg-transparent px-2 py-0 text-sm shadow-none ring-0 focus:ring-0"
              />
              <button type="button" onClick={addCustomTag} className="text-neutral-500 transition hover:text-neutral-900">
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-neutral-950">快乐背后的故事</label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="写下这份快乐为什么值得被分享，购买后大家会看到完整内容。"
          />
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-neutral-950">标价 (Joy Coins)</label>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="10"
            icon={<Icon name="coin" className="h-4 w-4 text-accent-orange" />}
          />
          <p className="mt-3 text-sm text-neutral-500">建议定价：1-50 Joy Coins。把快乐分享给更多人吧！</p>
        </div>

        {formError ? (
          <div className="mt-6">
            <ErrorState title="提交前先看这里" description={formError} />
          </div>
        ) : null}

        <div className="mt-10">
          <Button
            fullWidth
            className="h-14 text-base"
            onClick={() => {
              setFormError(null)
              void submitMutation.mutate()
            }}
            disabled={submitMutation.isPending}
            iconRight={<Icon name="rocket" className="h-4 w-4" />}
          >
            {submitMutation.isPending ? '正在上架…' : '上架这份快乐'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  )
}
