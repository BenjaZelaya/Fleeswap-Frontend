import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../shared/components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import ForgotPassword from '../features/auth/pages/ForgotPassword'
import ResetPassword from '../features/auth/pages/ResetPassword'
import ChangePassword from '../features/auth/pages/ChangePassword'
import CompleteProfile from '../features/profile/pages/CompleteProfile'
import PublicProfile from '../features/profile/pages/PublicProfile'
import EditProfile from '../features/profile/pages/EditProfile'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas con navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route
            path="/edit-profile"
            element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}
          />
        </Route>

        {/* Rutas de auth — sin navbar, con AuthLayout propio */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/complete-profile"
          element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  )
}
