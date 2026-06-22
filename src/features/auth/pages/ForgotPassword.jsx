import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import Seo from '../../../shared/components/Seo'
import FormField, { inputClass } from '../../../shared/components/forms/FormField'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validateEmail } from '../../../shared/utils/validators'

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
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Revisá tu email" subtitle="Te enviamos las instrucciones de recuperación">
        <Seo page="forgotPassword" />
        <div className="space-y-5">
          <div className="rounded-xl bg-brand/8 p-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/15">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Si <span className="font-semibold text-slate-800">{email}</span> está registrado, vas a
              recibir el link en los próximos minutos.
            </p>
            <p className="mt-2 text-xs text-slate-400">Si no lo recibiste, revisá la carpeta de spam.</p>
          </div>

          <Link
            to="/login"
            className="block text-center text-sm font-semibold text-brand transition-colors hover:text-brand-light"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Ingresá tu email y te enviamos un link">
      <Seo page="forgotPassword" />
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

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="font-semibold text-brand transition-colors hover:text-brand-light">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
