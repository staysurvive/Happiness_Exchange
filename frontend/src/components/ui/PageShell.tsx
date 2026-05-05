import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type PageShellProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}>

export function PageShell({
  title,
  description,
  actions,
  className,
  children,
}: PageShellProps) {
  return (
    <div className={cn('page-shell', className)}>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="body-muted mt-3">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}
