import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

export function PageContainer({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mx-auto max-w-[1200px] px-4 md:px-6', className)}>{children}</div>
}
