import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import FormField, { inputClass } from '../../../shared/components/forms/FormField'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validateEmail } from '../../../utils/validators'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) return setError(emailError)

    setLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      // Respuesta genérica para no revelar si el email existe
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Revisá tu email" subtitle="Te enviamos las instrucciones de recuperación">
        <div className="space-y-5">
          <div className="bg-brand/8 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-brand/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Si <span className="font-semibold text-gray-800">{email}</span> está registrado, vas a
              recibir el link en los próximos minutos.
            </p>
            <p className="text-xs text-gray-400 mt-2">¿No lo recibiste? Revisá la carpeta de spam.</p>
          </div>

          <Link
            to="/login"
            className="block text-center text-sm font-semibold text-brand-accent hover:text-brand transition-colors"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Ingresá tu email y te enviamos un link">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email" error={error}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="ejemplo@correo.com"
            className={inputClass(error)}
          />
        </FormField>

        <SubmitButton loading={loading} label="Enviar instrucciones" loadingLabel="Enviando..." />
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        <Link to="/login" className="text-brand font-semibold hover:text-brand-light transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
