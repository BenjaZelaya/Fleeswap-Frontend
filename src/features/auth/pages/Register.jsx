import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import useAuthStore from '../store/authStore'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import FormField, { inputClass } from '../../../shared/components/forms/FormField'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateBirthDate,
} from '../../../utils/validators'

const MAX_BIRTH_DATE = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})()

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    return {
      nombre: validateName(form.nombre, 'El nombre'),
      apellido: validateName(form.apellido, 'El apellido'),
      fechaNacimiento: validateBirthDate(form.fechaNacimiento),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: validatePasswordMatch(form.password, form.confirm),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    const hasErrors = Object.values(errs).some(Boolean)
    if (hasErrors) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      const data = await register({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        email: form.email,
        password: form.password,
      })
      setAuth(data.user, data.token)
      navigate('/complete-profile')
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ email: 'El email ya está en uso' })
      } else {
        setErrors({ general: 'Ocurrió un error, intentá de nuevo' })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Accedé a tu archivo digital de nostalgia">
      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4 text-center">
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nombre" error={errors.nombre}>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan"
              className={inputClass(errors.nombre)}
            />
          </FormField>

          <FormField label="Apellido" error={errors.apellido}>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Pérez"
              className={inputClass(errors.apellido)}
            />
          </FormField>
        </div>

        <FormField label="Fecha de nacimiento" error={errors.fechaNacimiento}>
          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={handleChange}
            max={MAX_BIRTH_DATE}
            className={inputClass(errors.fechaNacimiento)}
          />
        </FormField>

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

        <FormField label="Contraseña" error={errors.password}>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={inputClass(errors.password)}
          />
        </FormField>

        <FormField label="Confirmar contraseña" error={errors.confirm}>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            className={inputClass(errors.confirm)}
          />
        </FormField>

        <SubmitButton loading={loading} label="Registrarse →" loadingLabel="Registrando..." />
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿Ya tenés una cuenta?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
