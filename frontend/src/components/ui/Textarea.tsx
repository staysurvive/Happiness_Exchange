import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[140px] w-full rounded-[24px] border border-black/8 bg-neutral-50/90 px-4 py-4 text-[15px] leading-7 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-black/5',
        className,
      )}
      {...props}
    />
  )
}
