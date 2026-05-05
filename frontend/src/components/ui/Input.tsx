import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode
}

export function Input({ className, icon, ...props }: Props) {
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400">{icon}</div> : null}
      <input
        className={cn(
          'h-14 w-full rounded-[22px] border border-black/8 bg-neutral-50/90 px-4 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-black/5',
          icon ? 'pl-12' : '',
          className,
        )}
        {...props}
      />
    </div>
  )
}
