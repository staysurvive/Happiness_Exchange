import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageContainer } from '../components/ui/PageContainer'

export function NotFoundPage() {
  return (
    <PageContainer className="flex min-h-screen items-center justify-center py-12">
      <Card className="max-w-xl px-8 py-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-neutral-400">404</p>
        <h1 className="mt-4 text-[36px] font-semibold tracking-[-0.03em] text-neutral-950 md:text-[48px]">
          这份快乐暂时迷路了
        </h1>
        <p className="body-muted mt-4">你可以先回首页，或者去市场看看新的情绪补给。</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/">
            <Button>回到首页</Button>
          </Link>
          <Link to="/market">
            <Button variant="secondary">去市场</Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  )
}
