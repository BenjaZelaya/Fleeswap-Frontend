import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Toaster position="top-right" richColors />
      <Navbar />
      <main className="pb-28 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
