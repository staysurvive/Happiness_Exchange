import { Card } from '../ui/Card'
import { Icon } from '../ui/Icon'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="mx-auto max-w-xl px-8 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon name="sparkles" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-950">{title}</h2>
      <p className="body-muted mt-3">{description}</p>
    </Card>
  )
}
