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
      <AuthLayout title="Revisá tu email" subtitle="Te enviamos las instrucciones para recuperar tu contraseña">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Si <span className="font-medium text-gray-800">{email}</span> está registrado, vas a recibir
            un email con el link para restablecer tu contraseña en los próximos minutos.
          </p>
          <p className="text-xs text-gray-400">
            ¿No lo recibiste? Revisá la carpeta de spam.
          </p>
          <Link to="/login" className="block text-sm text-blue-600 font-medium hover:underline mt-4">
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Ingresá tu email y te enviamos un link para restablecerla">
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
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
