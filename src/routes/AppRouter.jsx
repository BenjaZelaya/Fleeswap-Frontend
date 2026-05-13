import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from '../shared/components/ScrollToTop'
import MainLayout from '../shared/components/layout/MainLayout'
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageSpinner label="Cargando pagina" />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/publications/:id" element={<PublicationDetail />} />
            <Route
              path="/publications/create"
              element={<ProtectedRoute><CrearPublicacion /></ProtectedRoute>}
            />
            <Route
              path="/my-publications"
              element={<ProtectedRoute><MisPublicaciones /></ProtectedRoute>}
            />
            <Route
              path="/publications/:id/edit"
              element={<ProtectedRoute><EditPublication /></ProtectedRoute>}
            />
            <Route
              path="/edit-profile"
              element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
            />
            <Route
              path="/change-password"
              element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}
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
      </Suspense>
    </BrowserRouter>
  )
}
