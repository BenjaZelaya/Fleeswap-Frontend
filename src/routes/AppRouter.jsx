import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ScrollToTop from '../shared/components/ScrollToTop'
import MainLayout from '../shared/components/layout/MainLayout'
import ChatLayout from '../shared/components/layout/ChatLayout'
import NoFooterLayout from '../shared/components/layout/NoFooterLayout'
import PageSpinner from '../shared/components/ui/PageSpinner'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('../pages/Home'))
const Explore = lazy(() => import('../pages/Explore'))
const Login = lazy(() => import('../features/auth/pages/Login'))
const Register = lazy(() => import('../features/auth/pages/Register'))
const ForgotPassword = lazy(() => import('../features/auth/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('../features/auth/pages/ResetPassword'))
const ChangePassword = lazy(() => import('../features/auth/pages/ChangePassword'))
const CompleteProfile = lazy(() => import('../features/profile/pages/CompleteProfile'))
const PublicProfile = lazy(() => import('../features/profile/pages/PublicProfile'))
const EditProfile = lazy(() => import('../features/profile/pages/EditProfile'))
const CrearPublicacion = lazy(() => import('../features/publications/pages/CrearPublicacion'))
const MisPublicaciones = lazy(() => import('../features/publications/pages/MisPublicaciones'))
const EditPublication = lazy(() => import('../features/publications/pages/EditPublication'))
const PublicationDetail = lazy(() => import('../features/publications/pages/PublicationDetail'))

const ChatView = lazy(() => import('../features/solicitudes/pages/ChatView'))
const MensajeriaView = lazy(() => import('../features/solicitudes/pages/MensajeriaView'))
const CrearBusquedaActiva = lazy(() => import('../features/search/pages/CrearBusquedaActiva'))
const MisBusquedasActivas = lazy(() => import('../features/search/pages/MisBusquedasActivas'))
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'))
const AdminUsers = lazy(() => import('../features/admin/pages/AdminUsers'))
const AdminReportes = lazy(() => import('../features/admin/pages/AdminReportes'))
const MisNotificaciones = lazy(() => import('../features/notifications/pages/MisNotificaciones'))
const MisIntercambios = lazy(() => import('../features/solicitudes/pages/MisIntercambios'))
const NotFound = lazy(() => import('../pages/NotFound'))

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/publications/:id" element={<PublicationDetail />} />
          <Route
            path="/my-publications"
            element={<ProtectedRoute><MisPublicaciones /></ProtectedRoute>}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/usuarios"
            element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>}
          />
          <Route
            path="/admin/reportes"
            element={<ProtectedRoute requireAdmin={true}><AdminReportes /></ProtectedRoute>}
          />
          {/* Catch-all: rutas no definidas */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── Layout sin footer ────────────────────────────────────── */}
        <Route element={<NoFooterLayout />}>
          <Route
            path="/edit-profile"
            element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
          />
          <Route
            path="/publications/create"
            element={<ProtectedRoute><CrearPublicacion /></ProtectedRoute>}
          />
          <Route
            path="/publications/:id/edit"
            element={<ProtectedRoute><EditPublication /></ProtectedRoute>}
          />

          <Route
            path="/search/crear"
            element={<ProtectedRoute><CrearBusquedaActiva /></ProtectedRoute>}
          />
          <Route
            path="/mis-notificaciones"
            element={<ProtectedRoute><MisNotificaciones /></ProtectedRoute>}
          />
          <Route
            path="/search/mis-busquedas"
            element={<ProtectedRoute><MisBusquedasActivas /></ProtectedRoute>}
          />
          <Route
            path="/mis-intercambios"
            element={<ProtectedRoute><MisIntercambios /></ProtectedRoute>}
          />
        </Route>

        {/* ── Chat: layout propio sin footer ni bottom bar ─────────── */}
        <Route element={<ChatLayout />}>
          <Route
            path="/intercambios/:id/chat"
            element={<ProtectedRoute><ChatView /></ProtectedRoute>}
          />
          <Route
            path="/chats"
            element={<ProtectedRoute><MensajeriaView /></ProtectedRoute>}
          />
          <Route
            path="/chats/:intercambioId"
            element={<ProtectedRoute><MensajeriaView /></ProtectedRoute>}
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/complete-profile"
          element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>}
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageSpinner label="Cargando pagina" />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
