<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
=======
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
import useAuthStore from '../store/authStore'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import FormField, { inputClass } from '../../../shared/components/forms/FormField'
import PasswordInput from '../../../shared/components/forms/PasswordInput'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validateEmail } from '../../../utils/validators'
>>>>>>> 5441611c391351761adad736902fe02f296307f6

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

<<<<<<< HEAD
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔥 LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!form.email || !form.password) {
      return setErrors({ general: "Completá todos los campos" });
    }
=======
  function validate() {
    const errs = {}
    const emailError = validateEmail(form.email)
    if (emailError) errs.email = emailError
    if (!form.password) errs.password = 'La contraseña es obligatoria'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)
>>>>>>> 5441611c391351761adad736902fe02f296307f6

    setLoading(true);
    setErrors({});

    try {
<<<<<<< HEAD
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
=======
      const data = await login(form.email, form.password)
      setAuth(data.user, data.accessToken)
      navigate(location.state?.from?.pathname || '/')
    } catch (err) {
      const status = err.response?.status
      if (!err.response) {
        setErrors({ general: 'No se pudo conectar con el servidor' })
      } else if (status === 401 || status === 400) {
        setErrors({ general: 'Email o contraseña incorrectos' })
      } else {
        setErrors({ general: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }
>>>>>>> 5441611c391351761adad736902fe02f296307f6

  const successMessage = location.state?.message

  return (
<<<<<<< HEAD
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
=======
    <AuthLayout title="Bienvenido de vuelta" subtitle="Iniciá sesión para continuar">
      {successMessage && (
        <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
>>>>>>> 5441611c391351761adad736902fe02f296307f6
        </p>
      )}
      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </p>
      )}

<<<<<<< HEAD
      </div>
    </div>
  );
}
=======
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            className={inputClass(errors.email)}
          />
        </FormField>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs text-brand-accent hover:text-brand font-medium transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        <SubmitButton loading={loading} label="Iniciar sesión" loadingLabel="Ingresando..." />
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿No tenés una cuenta?{' '}
        <Link to="/register" className="text-brand font-semibold hover:text-brand-light transition-colors">
          Registrate
        </Link>
      </p>
    </AuthLayout>
  )
}
>>>>>>> 5441611c391351761adad736902fe02f296307f6
