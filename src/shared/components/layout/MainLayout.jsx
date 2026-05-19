import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-white">
      <Toaster position="top-right" richColors />
      <Navbar />
      <main id="main-content" className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div>
  )
}
