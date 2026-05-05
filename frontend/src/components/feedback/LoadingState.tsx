import { Card } from '../ui/Card'

export function LoadingState({ title = '正在加载', description = '请稍等，快乐马上就到。' }: { title?: string; description?: string }) {
  return (
    <Card className="mx-auto max-w-xl px-8 py-12 text-center">
      <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      <h2 className="text-xl font-semibold text-neutral-950">{title}</h2>
      <p className="body-muted mt-3">{description}</p>
    </Card>
  )
}
