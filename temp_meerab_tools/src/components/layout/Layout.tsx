import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { ToastProvider } from '../ui/Toast'
import ThemeProvider from './ThemeProvider'
import AmbientBackground from './AmbientBackground'
import { AuthProvider } from '../../context/AuthContext'
import AuthModal from '../auth/AuthModal'

export default function Layout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AmbientBackground />
          <AuthModal />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <ScrollRestoration />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}