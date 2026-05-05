import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'

type RouteKey = 'home' | 'market' | 'publish' | 'product' | 'profile' | 'auth' | 'default'
type BubbleSide = 'left' | 'right'
type ViewportMode = 'mobile' | 'desktop'

type SpriteSpot = {
  top?: string
  right?: string
  bottom?: string
  left?: string
  scale: number
  rotate: number
  bubbleSide: BubbleSide
}

type SpriteExpression = {
  tone: 'sunrise' | 'peach' | 'mint' | 'starlight' | 'dream'
  leftEye: 'dot' | 'wink' | 'sleep'
  rightEye: 'dot' | 'wink' | 'sleep'
  mouth: 'smile' | 'open' | 'grin' | 'tiny'
}

const EXPRESSIONS: SpriteExpression[] = [
  { tone: 'sunrise', leftEye: 'dot', rightEye: 'dot', mouth: 'smile' },
  { tone: 'peach', leftEye: 'wink', rightEye: 'dot', mouth: 'grin' },
  { tone: 'mint', leftEye: 'dot', rightEye: 'dot', mouth: 'open' },
  { tone: 'starlight', leftEye: 'sleep', rightEye: 'sleep', mouth: 'tiny' },
  { tone: 'dream', leftEye: 'dot', rightEye: 'wink', mouth: 'smile' },
]

const GENERIC_LINES = [
  '今天也会捡到一点点快乐的。',
  '慢慢来也会很可爱。',
  '我在帮你看守今天的小确幸。',
  '眨一下眼，坏情绪会轻一点。',
  '你已经比刚才更接近开心啦。',
  '别急，快乐有时会拐个弯再来。',
]

const CLICK_LINES = [
  '嘿，戳到我啦。',
  '收到，一份快乐加急投递中。',
  '我刚刚偷偷给你补了一点元气。',
  '再点一下，我会更得意一点。',
]

const ROUTE_LINES: Record<RouteKey, string[]> = {
  home: [
    '首页的空气里有新鲜快乐。',
    '先看看今天适合哪一种补给。',
  ],
  market: [
    '挑一份最像今天心情的快乐吧。',
    '这页有很多认真发光的小东西。',
  ],
  publish: [
    '你写下的快乐，会被别人认真收下。',
    '把今天的小亮光也上架吧。',
  ],
  product: [
    '这份快乐看起来很会安慰人。',
    '先眨眨眼，再决定要不要带它回家。',
  ],
  profile: [
    '今天的你也值得被奖励。',
    '你的快乐仓库正在变得圆滚滚。',
  ],
  auth: [
    '注册一下，我帮你守着快乐币。',
    '欢迎回来，今天也一起发光吧。',
  ],
  default: ['我在这儿陪你逛一会儿。'],
}

const DESKTOP_SPOTS: Record<RouteKey, SpriteSpot[]> = {
  home: [
    { top: '18%', right: '8%', scale: 1.08, rotate: -8, bubbleSide: 'left' },
    { top: '31%', left: '6%', scale: 0.96, rotate: 7, bubbleSide: 'right' },
    { top: '58%', right: '10%', scale: 1.02, rotate: -5, bubbleSide: 'left' },
  ],
  market: [
    { top: '24%', right: '8%', scale: 1.02, rotate: -6, bubbleSide: 'left' },
    { top: '54%', left: '7%', scale: 0.94, rotate: 6, bubbleSide: 'right' },
    { top: '68%', right: '11%', scale: 1, rotate: -3, bubbleSide: 'left' },
  ],
  publish: [
    { top: '20%', right: '8%', scale: 1.04, rotate: -7, bubbleSide: 'left' },
    { top: '62%', left: '9%', scale: 0.94, rotate: 5, bubbleSide: 'right' },
  ],
  product: [
    { top: '22%', left: '7%', scale: 1.02, rotate: 5, bubbleSide: 'right' },
    { top: '56%', right: '8%', scale: 0.98, rotate: -6, bubbleSide: 'left' },
  ],
  profile: [
    { top: '21%', right: '9%', scale: 1.04, rotate: -6, bubbleSide: 'left' },
    { top: '63%', left: '8%', scale: 0.96, rotate: 4, bubbleSide: 'right' },
  ],
  auth: [
    { top: '22%', right: '10%', scale: 0.98, rotate: -4, bubbleSide: 'left' },
    { top: '70%', left: '11%', scale: 0.9, rotate: 6, bubbleSide: 'right' },
  ],
  default: [
    { top: '24%', right: '8%', scale: 1, rotate: -6, bubbleSide: 'left' },
    { top: '62%', left: '8%', scale: 0.94, rotate: 4, bubbleSide: 'right' },
  ],
}

const MOBILE_SPOTS: Record<RouteKey, SpriteSpot[]> = {
  home: [
    { top: '16%', right: '4%', scale: 0.84, rotate: -7, bubbleSide: 'left' },
    { top: '48%', left: '3%', scale: 0.8, rotate: 6, bubbleSide: 'right' },
    { bottom: '110px', right: '4%', scale: 0.82, rotate: -4, bubbleSide: 'left' },
  ],
  market: [
    { top: '18%', right: '4%', scale: 0.82, rotate: -6, bubbleSide: 'left' },
    { top: '52%', left: '2%', scale: 0.78, rotate: 5, bubbleSide: 'right' },
    { bottom: '110px', right: '4%', scale: 0.8, rotate: -3, bubbleSide: 'left' },
  ],
  publish: [
    { top: '18%', right: '4%', scale: 0.82, rotate: -5, bubbleSide: 'left' },
    { bottom: '118px', left: '3%', scale: 0.78, rotate: 4, bubbleSide: 'right' },
  ],
  product: [
    { top: '17%', right: '4%', scale: 0.82, rotate: -5, bubbleSide: 'left' },
    { bottom: '118px', left: '3%', scale: 0.78, rotate: 5, bubbleSide: 'right' },
  ],
  profile: [
    { top: '18%', right: '4%', scale: 0.82, rotate: -6, bubbleSide: 'left' },
    { bottom: '124px', left: '3%', scale: 0.78, rotate: 4, bubbleSide: 'right' },
  ],
  auth: [
    { top: '14%', right: '4%', scale: 0.82, rotate: -4, bubbleSide: 'left' },
    { bottom: '52px', left: '4%', scale: 0.76, rotate: 5, bubbleSide: 'right' },
  ],
  default: [
    { top: '18%', right: '4%', scale: 0.8, rotate: -6, bubbleSide: 'left' },
    { bottom: '116px', left: '3%', scale: 0.78, rotate: 4, bubbleSide: 'right' },
  ],
}

function resolveRouteKey(pathname: string): RouteKey {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/market')) return 'market'
  if (pathname.startsWith('/publish')) return 'publish'
  if (pathname.startsWith('/products/')) return 'product'
  if (pathname.startsWith('/me')) return 'profile'
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return 'auth'
  return 'default'
}

function pickRandomIndex(length: number, currentIndex: number) {
  if (length <= 1) return 0
  let next = currentIndex
  while (next === currentIndex) {
    next = Math.floor(Math.random() * length)
  }
  return next
}

function pickRandomText(lines: string[], currentLine: string) {
  if (lines.length === 0) return ''
  if (lines.length === 1) return lines[0]

  let next = currentLine
  while (next === currentLine) {
    next = lines[Math.floor(Math.random() * lines.length)]
  }
  return next
}

function buildSpotStyle(spot: SpriteSpot): CSSProperties {
  return {
    top: spot.top,
    right: spot.right,
    bottom: spot.bottom,
    left: spot.left,
    transform: `translate3d(0, 0, 0) rotate(${spot.rotate}deg) scale(${spot.scale})`,
  }
}

export function JoySprite() {
  const location = useLocation()
  const routeKey = resolveRouteKey(location.pathname)
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [spotIndex, setSpotIndex] = useState(0)
  const [expressionIndex, setExpressionIndex] = useState(0)
  const [line, setLine] = useState(GENERIC_LINES[0])
  const [bubbleVisible, setBubbleVisible] = useState(true)
  const [isExcited, setIsExcited] = useState(false)
  const hideBubbleTimeoutRef = useRef<number | null>(null)
  const excitedTimeoutRef = useRef<number | null>(null)
  const lineRef = useRef(line)
  const reducedMotionRef = useRef(reducedMotion)

  const spotCatalog = viewportMode === 'mobile' ? MOBILE_SPOTS : DESKTOP_SPOTS
  const spots = spotCatalog[routeKey] ?? spotCatalog.default
  const currentSpot = spots[spotIndex % spots.length]
  const expression = EXPRESSIONS[expressionIndex % EXPRESSIONS.length]

  useEffect(() => {
    lineRef.current = line
  }, [line])

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
  }, [reducedMotion])

  useEffect(() => {
    const media = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

    const syncViewport = () => {
      setViewportMode(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }

    const syncMotionPreference = () => {
      setReducedMotion(media?.matches ?? false)
    }

    syncViewport()
    syncMotionPreference()

    window.addEventListener('resize', syncViewport)
    if (media) {
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', syncMotionPreference)
      } else if (typeof media.addListener === 'function') {
        media.addListener(syncMotionPreference)
      }
    }

    return () => {
      window.removeEventListener('resize', syncViewport)
      if (media) {
        if (typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', syncMotionPreference)
        } else if (typeof media.removeListener === 'function') {
          media.removeListener(syncMotionPreference)
        }
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (hideBubbleTimeoutRef.current !== null) {
        window.clearTimeout(hideBubbleTimeoutRef.current)
      }
      if (excitedTimeoutRef.current !== null) {
        window.clearTimeout(excitedTimeoutRef.current)
      }
    }
  }, [])

  function showSpeech(activeRouteKey: RouteKey, preferredLine?: string) {
    const speechPool = [...(ROUTE_LINES[activeRouteKey] ?? ROUTE_LINES.default), ...GENERIC_LINES]
    const nextLine = preferredLine ?? pickRandomText(speechPool, lineRef.current)

    setLine(nextLine)
    lineRef.current = nextLine
    setBubbleVisible(true)

    if (hideBubbleTimeoutRef.current !== null) {
      window.clearTimeout(hideBubbleTimeoutRef.current)
    }

    hideBubbleTimeoutRef.current = window.setTimeout(() => {
      setBubbleVisible(false)
    }, reducedMotionRef.current ? 5600 : 7200)
  }

  function refreshSprite(activeRouteKey: RouteKey, options?: { move?: boolean; speak?: boolean; preferredLine?: string }) {
    if (options?.move !== false) {
      setSpotIndex((current) => pickRandomIndex(spots.length, current))
    }

    setExpressionIndex((current) => pickRandomIndex(EXPRESSIONS.length, current))

    if (options?.speak) {
      showSpeech(activeRouteKey, options.preferredLine)
    }
  }

  useEffect(() => {
    setSpotIndex(0)
    setExpressionIndex(Math.floor(Math.random() * EXPRESSIONS.length))
    showSpeech(routeKey)
  }, [routeKey, viewportMode])

  useEffect(() => {
    const moveTimer = window.setInterval(() => {
      refreshSprite(routeKey, {
        move: true,
        speak: Math.random() > 0.62,
      })
    }, reducedMotion ? 42000 : 28000)

    const speechTimer = window.setInterval(() => {
      showSpeech(routeKey)
    }, reducedMotion ? 28000 : 18000)

    return () => {
      window.clearInterval(moveTimer)
      window.clearInterval(speechTimer)
    }
  }, [reducedMotion, routeKey, spots.length])

  function handleClick() {
    refreshSprite(routeKey, {
      move: true,
      speak: true,
      preferredLine: CLICK_LINES[Math.floor(Math.random() * CLICK_LINES.length)],
    })
    setIsExcited(true)

    if (excitedTimeoutRef.current !== null) {
      window.clearTimeout(excitedTimeoutRef.current)
    }

    excitedTimeoutRef.current = window.setTimeout(() => {
      setIsExcited(false)
    }, 520)
  }

  return (
    <div className="joy-sprite-layer">
      <div
        className="joy-sprite-anchor"
        data-bubble-side={currentSpot.bubbleSide}
        style={buildSpotStyle(currentSpot)}
      >
        <div className={cn('joy-sprite-bubble', bubbleVisible && 'is-visible')}>
          <span className="joy-sprite-bubble-label">快乐小精灵</span>
          <p>{line}</p>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'joy-sprite-button',
            reducedMotion && 'is-still',
            isExcited && 'is-excited',
          )}
          aria-label="和快乐小精灵互动"
        >
          <span className="joy-sprite-aura" />
          <span className="joy-sprite-spark joy-sprite-spark-a" />
          <span className="joy-sprite-spark joy-sprite-spark-b" />
          <span className="joy-sprite-spark joy-sprite-spark-c" />

          <span className={cn('joy-sprite-core', `is-${expression.tone}`)}>
            <span className="joy-sprite-bud joy-sprite-bud-left" />
            <span className="joy-sprite-bud joy-sprite-bud-right" />

            <span className="joy-sprite-face">
              <span className={cn('joy-sprite-eye joy-sprite-eye-left', `is-${expression.leftEye}`)} />
              <span className={cn('joy-sprite-eye joy-sprite-eye-right', `is-${expression.rightEye}`)} />
              <span className="joy-sprite-cheek joy-sprite-cheek-left" />
              <span className="joy-sprite-cheek joy-sprite-cheek-right" />
              <span className={cn('joy-sprite-mouth', `is-${expression.mouth}`)} />
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
