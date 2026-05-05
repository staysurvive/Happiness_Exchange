import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

export function ErrorState({
  title = '出了点小问题',
  description = '当前内容暂时无法加载。',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <Card className="mx-auto max-w-xl px-8 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Icon name="refresh" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-950">{title}</h2>
      <p className="body-muted mt-3">{description}</p>
      {onRetry ? (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>
            再试一次
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
