import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { useLoginMutation } from '../features/auth/hooks'
import { ApiError } from '../lib/api-client'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  const from = typeof location.state === 'object' && location.state && 'from' in location.state ? String(location.state.from) : '/me'
  const registered = typeof location.state === 'object' && location.state && 'registered' in location.state

  return (
    <main className="mx-auto w-full max-w-[480px]">
      <Card className="relative overflow-hidden border-white/80 bg-white/76 px-6 py-8 backdrop-blur-2xl md:px-8 md:py-10">
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink opacity-60" />
        <div className="text-center">
          <h1 className="page-title text-[40px] md:text-[56px]">欢迎回来</h1>
          <p className="body-muted mt-3">今天也收一点快乐。</p>
        </div>

        {registered ? <p className="mt-6 text-center text-sm text-emerald-600">注册成功，现在登录就能领取你的快乐币。</p> : null}
        {formError ? <p className="mt-6 text-center text-sm text-rose-500">{formError}</p> : null}

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            setFormError(null)
            void loginMutation.mutate(
              { email, password },
              {
                onSuccess: () => {
                  navigate(from, { replace: true })
                },
                onError: (error) => {
                  setFormError(error instanceof ApiError ? error.detail : '登录失败，请稍后再试。')
                },
              },
            )
          }}
        >
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="输入邮箱地址"
            icon={<Icon name="mail" className="h-4 w-4" />}
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="输入密码"
            icon={<Icon name="lock" className="h-4 w-4" />}
          />

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={() => setRemember((value) => !value)} className="h-4 w-4 rounded border-black/10" />
              <span>记住我</span>
            </label>
            <span>忘记密码？</span>
          </div>

          <Button fullWidth type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '登录中…' : '登录快乐'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-500">
          还没有账号？{' '}
          <Link to="/register" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
            开启快乐之旅
          </Link>
        </p>
      </Card>
    </main>
  )
}
