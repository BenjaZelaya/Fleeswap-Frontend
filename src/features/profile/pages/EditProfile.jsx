import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateProfile } from '../services/profileService'
import useAuthStore from '../../auth/store/authStore'
import { BIO_MAX, LOCATION_MAX } from '../../../utils/constants'
import { validateBio, validateLocation } from '../../../utils/validators'

export default function EditProfile() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const [original, setOriginal] = useState({ photo: null, bio: '', location: '' })
  const [photo, setPhoto] = useState(null)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasChanges =
    photo !== original.photo ||
    bio.trim() !== (original.bio ?? '') ||
    location.trim() !== (original.location ?? '')

  // Cargar datos actuales del perfil
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

  // Cargar script de Cloudinary
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://upload-widget.cloudinary.com/global/all.js'
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  function openUploadWidget() {
    if (!window.cloudinary) {
      setError('El widget de Cloudinary no está disponible. Recargá la página.')
      return
    }
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'fleeswap_unsigned',
        sources: ['local', 'url', 'camera'],
        resourceType: 'auto',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000,
      },
      (err, result) => {
        if (err) {
          setError('Error al subir la foto. Intentá de nuevo.')
        } else if (result?.event === 'success') {
          setPhoto(result.info.secure_url)
          setError('')
        }
      }
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Editar perfil</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 mb-6">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-3 mb-6">
            Perfil actualizado correctamente.
          </p>
        )}

        <div className="space-y-6">
          {/* Foto */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Foto de perfil
            </label>
            {photo ? (
              <div className="flex items-center gap-4">
                <img
                  src={photo}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={openUploadWidget}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Cambiar foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Eliminar foto
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <p className="text-sm font-medium text-gray-700">Subir foto</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG o WebP</p>
              </button>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Biografía
              </label>
              <span className="text-xs text-gray-400">{bio.length}/{BIO_MAX}</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= BIO_MAX) setBio(e.target.value)
                setError('')
                setSuccess(false)
              }}
              placeholder="Contá algo sobre vos..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24"
            />
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ubicación
              </label>
              <span className="text-xs text-gray-400">{location.length}/{LOCATION_MAX}</span>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                if (e.target.value.length <= LOCATION_MAX) setLocation(e.target.value)
                setError('')
                setSuccess(false)
              }}
              placeholder="Ciudad, País"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
