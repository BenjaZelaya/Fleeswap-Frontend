import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../shared/components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import CompleteProfile from '../features/profile/pages/CompleteProfile'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas con navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Rutas de auth — sin navbar, con AuthLayout propio */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
