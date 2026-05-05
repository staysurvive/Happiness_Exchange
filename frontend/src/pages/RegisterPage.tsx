import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { useRegisterMutation } from '../features/auth/hooks'
import { ApiError } from '../lib/api-client'

export function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  return (
    <main className="mx-auto w-full max-w-[520px]">
      <Card className="relative overflow-hidden border-white/80 bg-white/76 px-6 py-8 backdrop-blur-2xl md:px-8 md:py-10">
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink opacity-60" />
        <div className="text-center">
          <h1 className="page-title text-[40px] md:text-[56px]">开启快乐之旅</h1>
          <p className="body-muted mt-3">注册后默认获得 100 快乐币。</p>
        </div>

        {formError ? <p className="mt-6 text-center text-sm text-rose-500">{formError}</p> : null}

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            setFormError(null)
            if (password !== confirmPassword) {
              setFormError('两次输入的密码不一致。')
              return
            }
            void registerMutation.mutate(
              { username, email, password },
              {
                onSuccess: () => {
                  navigate('/login', { replace: true, state: { registered: true } })
                },
                onError: (error) => {
                  setFormError(error instanceof ApiError ? error.detail : '注册失败，请稍后再试。')
                },
              },
            )
          }}
        >
          <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="输入用户名" icon={<Icon name="user" className="h-4 w-4" />} />
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="输入邮箱地址" icon={<Icon name="mail" className="h-4 w-4" />} />
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="设置密码" icon={<Icon name="lock" className="h-4 w-4" />} />
          <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="再次输入密码" icon={<Icon name="check" className="h-4 w-4" />} />

          <Button fullWidth type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? '注册中…' : '领取我的快乐币'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-500">
          已经有账号了？{' '}
          <Link to="/login" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
            回到登录
          </Link>
        </p>
      </Card>
    </main>
  )
}
