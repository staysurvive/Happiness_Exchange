import { RouterProvider } from 'react-router-dom'
import { useAuthBootstrap } from './features/auth/hooks'
import { appRouter } from './router'

function AuthBootstrapper() {
  useAuthBootstrap()
  return null
}

function App() {
  return (
    <>
      <AuthBootstrapper />
      <RouterProvider router={appRouter} />
    </>
  )
}

export default App
