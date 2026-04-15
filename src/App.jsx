import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./pages/Home";

import PublicProfilePage from "./features/profile/pages/PublicProfilePage";
import EditProfilePage from "./features/profile/pages/EditProfilePage";

import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Perfil protegido */}
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <PublicProfilePage />
            </ProtectedRoute>
          }
        />

        {/*Editar perfil protegido */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;