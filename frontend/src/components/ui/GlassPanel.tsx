import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type GlassPanelProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div className={cn('glass-panel p-6', className)} {...props}>
      {children}
    </div>
  )
}
