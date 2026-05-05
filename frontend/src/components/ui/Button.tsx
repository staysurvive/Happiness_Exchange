import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  className,
  variant = 'primary',
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        variant === 'primary' && 'bg-neutral-950 text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] hover:brightness-110 active:scale-[0.98]',
        variant === 'secondary' && 'border border-black/8 bg-white/84 text-neutral-950 backdrop-blur-xl hover:bg-white',
        variant === 'ghost' && 'bg-transparent text-neutral-600 hover:bg-white/70 hover:text-neutral-950',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}
