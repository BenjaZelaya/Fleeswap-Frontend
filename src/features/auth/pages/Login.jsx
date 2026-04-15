import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔥 LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!form.email || !form.password) {
      return setErrors({ general: "Completá todos los campos" });
    }

    setLoading(true);
    setErrors({});

    try {
      // 🔥 SIMULACIÓN LOGIN REAL
      if (form.email === "test@test.com" && form.password === "1234") {
        const fakeUser = {
          id: 1,
          nombre: "Santino Madueno",
          foto: "https://via.placeholder.com/150",
          bio: "Fan del intercambio",
          ubicacion: "Argentina",
          calificacion: 4.5,
          intercambios: 12,
          publicaciones: [
            { id: 1, titulo: "Camiseta Boca", tipo: "Intercambio" },
            { id: 2, titulo: "Vinilo Duki", tipo: "Venta" },
          ],
        };

        // 🔥 GUARDAR EN ZUSTAND
        setAuth(fakeUser, "fake-token");

        // 🔥 REDIRIGIR AL PERFIL
        navigate("/profile/1");
      } else {
        setErrors({ general: "Email o contraseña incorrectos" });
      }
    } catch (err) {
      setErrors({ general: "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 INPUTS
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-sm">

        <h1 className="text-center text-2xl font-bold text-blue-600 mb-1">
          Fleeswap
        </h1>

        <h2 className="text-center text-xl font-semibold text-gray-800 mb-1">
          Iniciar sesión
        </h2>

        <p className="text-center text-sm text-gray-400 mb-8">
          Accede a tu archivo digital de nostalgia
        </p>

        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4 text-center">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="test@test.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="1234"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  );
}