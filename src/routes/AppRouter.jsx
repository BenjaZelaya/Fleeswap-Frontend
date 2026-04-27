import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from '../shared/components/ScrollToTop'
import MainLayout from '../shared/components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'

// PÁGINAS GENERALES
import Home from '../pages/Home'

// AUTH
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import ForgotPassword from '../features/auth/pages/ForgotPassword'
import ResetPassword from '../features/auth/pages/ResetPassword'
import ChangePassword from '../features/auth/pages/ChangePassword'

// PROFILE
import CompleteProfile from '../features/profile/pages/CompleteProfile'
import PublicProfile from '../features/profile/pages/PublicProfile'
import EditProfile from '../features/profile/pages/EditProfile'

// PUBLICATIONS ✅ (AHORA CORRECTO)
import PublicationsList from '../features/publications/pages/PublicationsList'
import CrearPublicacion from '../features/publications/pages/CrearPublicacion'
import PublicationDetail from '../features/publications/pages/PublicationDetail'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* 🔷 RUTAS CON NAVBAR */}
        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/profile/:id" element={<PublicProfile />} />

          {/* 🟢 LISTA (H2.6) */}
          <Route path="/publications" element={<PublicationsList />} />

          {/* 🟢 DETALLE (H2.5) */}
          <Route path="/publications/:id" element={<PublicationDetail />} />

          {/* 🔒 PROTEGIDAS */}
          <Route
            path="/publications/create"
            element={
              <ProtectedRoute>
                <CrearPublicacion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* 🔶 AUTH (sin navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}