import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicOnlyRoute } from './components/layout/PublicOnlyRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MarketPage } from './pages/MarketPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublishPage } from './pages/PublishPage'
import { RegisterPage } from './pages/RegisterPage'
import { WalletPage } from './pages/WalletPage'

export const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/market', element: <MarketPage /> },
      { path: '/products/:productId', element: <ProductDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/publish', element: <PublishPage /> },
          { path: '/me', element: <ProfilePage /> },
          { path: '/me/wallet', element: <WalletPage /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  { path: '/warehouse', element: <Navigate to="/me?tab=collections" replace /> },
  { path: '*', element: <NotFoundPage /> },
])
