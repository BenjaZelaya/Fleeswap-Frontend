import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMyProfile, updateProfile, deleteAccount } from '../services/profileService'
import useAuthStore from '../../../store/authStore'
import { logout as logoutService } from '../../auth/services/authService'
import useCloudinaryWidget from '../../../shared/hooks/useCloudinaryWidget'
import { BIO_MAX, LOCATION_MAX } from '../../../utils/constants'
import { validateBio, validateLocation } from '../../../utils/validators'
import PasswordInput from '../../../shared/components/forms/PasswordInput'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'

function Section({ title, children, danger }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 ${danger ? 'border-red-100' : 'border-slate-100'}`}>
      {title && (
        <h2 className={`text-[10px] font-light uppercase tracking-[0.2em] mb-5 ${danger ? 'text-red-400' : 'text-slate-400'}`}>
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { updateUser, logout } = useAuthStore()
  const { openWidget } = useCloudinaryWidget()

  const [original, setOriginal] = useState({ photo: null, bio: '', location: '' })
  const [photo, setPhoto] = useState(null)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const hasChanges =
    photo !== original.photo ||
    bio.trim() !== (original.bio ?? '') ||
    location.trim() !== (original.location ?? '')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile()
        const initial = {
          photo: data.photo ?? null,
          bio: data.bio ?? '',
          location: data.location ?? '',
        }
        setOriginal(initial)
        setPhoto(initial.photo)
        setBio(initial.bio)
        setLocation(initial.location)
      } catch {
        setError('No se pudo cargar el perfil. Intentá de nuevo.')
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  function openUploadWidget() {
    openWidget(
      (url) => { setPhoto(url); setError(''); setSuccess(false) },
      () => setError('Error al subir la foto. Intentá de nuevo.')
    )
  }

  async function handleSave() {
    if (!hasChanges) return
    setError('')
    setSuccess(false)

    const bioError = validateBio(bio)
    if (bioError) { setError(bioError); return }

    const locationError = validateLocation(location)
    if (locationError) { setError(locationError); return }

    setLoading(true)
    try {
      const payload = {}
      if (photo !== original.photo) payload.photo = photo
      if (bio.trim() !== original.bio) payload.bio = bio.trim()
      if (location.trim() !== original.location) payload.location = location.trim()

      const updated = await updateProfile(payload)
      updateUser(updated)
      setOriginal({ photo: updated.photo ?? null, bio: updated.bio ?? '', location: updated.location ?? '' })
      setSuccess(true)
    } catch {
      setError('Error al guardar los cambios. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletePassword) {
      setDeleteError('Ingresá tu contraseña para confirmar')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount(deletePassword)
      try { await logoutService() } catch { /* ignorar */ }
      logout()
      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) {
        setDeleteError('Contraseña incorrecta')
      } else {
        setDeleteError('Ocurrió un error. Intentá de nuevo.')
      }
    } finally {
      setDeleting(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-4"
    >
      {/* Encabezado de página */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Editar perfil</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      {/* Sección principal */}
      <Section>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Perfil actualizado correctamente.
          </p>
        )}

        <div className="space-y-6">
          {/* Foto */}
          <div>
            <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-3">
              Foto de perfil
            </label>
            {photo ? (
              <div className="flex items-center gap-4">
                <img
                  src={photo}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
                />
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={openUploadWidget} className="text-sm font-medium text-brand-accent hover:text-brand transition-colors">
                    Cambiar foto
                  </button>
                  <button type="button" onClick={() => setPhoto(null)} className="text-sm font-medium text-red-400 hover:text-red-500 transition-colors">
                    Eliminar foto
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand/40 hover:bg-brand/5 transition-all group"
              >
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-brand/15 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-brand-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-brand-accent transition-colors">Subir foto</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG o WebP · Máx. 5 MB</p>
              </button>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400">Biografía</label>
              <span className="text-[10px] font-light text-slate-300">{bio.length}/{BIO_MAX}</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); setError(''); setSuccess(false) }}
              placeholder="Contá algo sobre vos..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-brand focus:ring-0 hover:border-gray-400 resize-none h-24"
            />
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400">Ubicación</label>
              <span className="text-[10px] font-light text-slate-300">{location.length}/{LOCATION_MAX}</span>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => { if (e.target.value.length <= LOCATION_MAX) setLocation(e.target.value); setError(''); setSuccess(false) }}
              placeholder="Ciudad, País"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-brand focus:ring-0 hover:border-gray-400"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="mt-8 w-full bg-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </Section>

      {/* Seguridad */}
      <Section title="Seguridad">
        <Link
          to="/change-password"
          className="flex items-center justify-between text-sm text-gray-700 hover:text-brand-accent transition-colors group"
        >
          <span className="font-medium">Cambiar contraseña</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-brand-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </Section>

      {/* Zona de peligro */}
      <Section title="Zona de peligro" danger>
        <p className="text-xs text-gray-400 mb-4">
          Eliminar tu cuenta es una acción irreversible. Todos tus datos serán desactivados permanentemente.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          Eliminar mi cuenta →
        </button>
      </Section>

      {/* Modal confirmar eliminación */}
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError('') }}
        onConfirm={handleDelete}
        title="¿Eliminar tu cuenta?"
        description="Esta acción es irreversible. Todos tus datos serán eliminados permanentemente."
        confirmLabel="Sí, eliminar"
        variant="danger"
        loading={deleting}
      >
        <div className="mb-1">
          {deleteError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">{deleteError}</p>
          )}
          <PasswordInput
            value={deletePassword}
            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError('') }}
            placeholder="Ingresá tu contraseña para confirmar"
            error={deleteError}
          />
        </div>
      </ConfirmModal>
    </motion.div>
  )
}
