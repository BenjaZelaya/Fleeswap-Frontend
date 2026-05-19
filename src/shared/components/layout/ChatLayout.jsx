/**
 * ChatLayout.jsx
 *
 * Layout exclusivo para la vista de chat.
 * - Incluye la Navbar (para navegación y logout)
 * - SIN Footer ni padding bottom del mobile bar
 * - El contenedor ocupa exactamente 100dvh (o 100vh como fallback)
 * - overflow: hidden en el root para que SOLO el área de mensajes haga scroll
 */

import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './Navbar'

export default function ChatLayout() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}  // dvh = dynamic viewport height (iOS Safari safe)
    >
      <Toaster position="top-right" richColors />
      <Navbar />
      {/* flex-1 + overflow-hidden: el chat internamente maneja su propio scroll */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
