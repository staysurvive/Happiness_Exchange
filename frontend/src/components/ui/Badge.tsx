import { cn } from '../../lib/cn'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  tone?: 'neutral' | 'yellow' | 'blue' | 'pink' | 'orange' | 'green' | 'purple'
  className?: string
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  neutral: 'bg-neutral-100 text-neutral-600',
  yellow: 'bg-accent-yellow/80 text-neutral-700',
  blue: 'bg-accent-blue/45 text-sky-900',
  pink: 'bg-accent-pink/55 text-rose-900',
  orange: 'bg-accent-orange/55 text-amber-900',
  green: 'bg-accent-green/70 text-emerald-900',
  purple: 'bg-accent-purple/55 text-violet-900',
}

export function Badge({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.02em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
