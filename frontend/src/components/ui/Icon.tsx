import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type IconName =
  | 'bell'
  | 'user'
  | 'coin'
  | 'heart'
  | 'bookmark'
  | 'bag'
  | 'plus'
  | 'image'
  | 'mail'
  | 'lock'
  | 'sparkles'
  | 'quote'
  | 'rocket'
  | 'close'
  | 'comment'
  | 'calendar'
  | 'refresh'
  | 'logout'
  | 'arrow-right'
  | 'check'
  | 'edit'

const paths: Record<IconName, ReactNode> = {
  bell: <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9" />,
  user: <path d="M15 19a7 7 0 1 0-6 0m6 0H9m6 0a8 8 0 0 1 6 7H3a8 8 0 0 1 6-7m6-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
  coin: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8m-2-6.2c.6-.5 1.3-.8 2-.8 1.7 0 3 1 3 2.3 0 3-5 1.7-5 4 0 1.1 1 2 2.3 2 .8 0 1.5-.3 2.1-.8" /></>,
  heart: <path d="m12 20-1.2-1.1C5.2 13.8 2 10.9 2 7.4 2 4.9 4 3 6.5 3A4.5 4.5 0 0 1 12 6.1 4.5 4.5 0 0 1 17.5 3C20 3 22 4.9 22 7.4c0 3.5-3.2 6.4-8.8 11.5L12 20Z" />,
  bookmark: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V22l-6-3-6 3V4.5Z" />,
  bag: <path d="M7 9V7a5 5 0 0 1 10 0v2m-11 0h12l1 12H5L6 9Zm4 0V7a2 2 0 1 1 4 0v2" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  image: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m7 15 2.5-2.5L13 16l2.5-3 3.5 4" /><circle cx="8.5" cy="9" r="1.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 1 1 8 0v3" /></>,
  sparkles: <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Zm7 10 .8 1.9L22 15l-2.2.9L19 18l-.8-2.1L16 15l2.2-.1L19 13ZM5 14l1 2.4L8.5 17 6 18l-1 2.5L4 18l-2.5-1 2.5-.6L5 14Z" />,
  quote: <path d="M8.5 10C7.1 10 6 11.1 6 12.5S7.1 15 8.5 15c.2 0 .5 0 .7-.1-.5 1.5-1.9 2.6-3.6 2.8V20c3.2-.2 5.8-2.8 6-6V10H8.5Zm9 0c-1.4 0-2.5 1.1-2.5 2.5S16.1 15 17.5 15c.2 0 .5 0 .7-.1-.5 1.5-1.9 2.6-3.6 2.8V20c3.2-.2 5.8-2.8 6-6V10h-3.1Z" />,
  rocket: <path d="M14 4c3.4.2 6 2.8 6.2 6.2l-4.7 4.7-3.6-3.6L16.6 6.6ZM11 12l3 3-6.5 6.5a1.4 1.4 0 0 1-2-2L11 12Zm-2.8-.2-1.7-1.7A2.5 2.5 0 0 1 6 8.3V5.5L9.5 9 8.2 11.8Zm7 7L19 18c1 .9 1 2.5 0 3.5l-.8.8-3.5-3.5.5-.5Z" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  comment: <path d="M5 18.5V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 2.5Z" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 9h16" /></>,
  refresh: <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" />,
  logout: <path d="M15 16 20 12l-5-4m5 4H9m3 8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />,
  'arrow-right': <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  edit: <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />,
}

type Props = {
  name: IconName
  className?: string
  filled?: boolean
}

export function Icon({ name, className, filled = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
