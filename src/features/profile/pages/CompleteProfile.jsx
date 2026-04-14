import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../services/profileService'
import useAuthStore from '../../auth/store/authStore'

const BIO_MAX = 300
const LOCATION_MAX = 100

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const [photo, setPhoto] = useState(null)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar el script de Cloudinary
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://upload-widget.cloudinary.com/global/all.js'
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  // Indicador de progreso
  const fieldsCompleted = (photo ? 1 : 0) + (bio.trim() ? 1 : 0) + (location.trim() ? 1 : 0)
  const progressPercentage = (fieldsCompleted / 3) * 100

  function openUploadWidget() {
    if (!window.cloudinary) {
      setError('El widget de Cloudinary no está disponible. Recarga la página.')
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
      (error, result) => {
        if (error) {
          setError('Error al subir la foto. Intenta de nuevo.')
          console.error('Upload error:', error)
        } else if (result?.event === 'success') {
          setPhoto(result.info.secure_url)
          setError('')
        }
      }
    )
  }

  async function handleSave() {
    setError('')

    if (!photo && !bio.trim() && !location.trim()) {
      setError('Completa al menos un campo')
      return
    }

    if (bio.trim() && bio.trim().length < 3) {
      setError('La bio debe tener al menos 3 caracteres')
      return
    }

    if (location.trim() && location.trim().length < 2) {
      setError('La ubicación debe tener al menos 2 caracteres')
      return
    }

    setLoading(true)
    try {
      const data = {
        ...(photo && { photo }),
        ...(bio.trim() && { bio: bio.trim() }),
        ...(location.trim() && { location: location.trim() }),
      }

      const result = await updateProfile(data)
      updateUser(result)
      navigate('/')
    } catch (err) {
      setError('Error al actualizar el perfil. Intenta de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-blue-600 mb-1">Fleeswap</h1>
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">Completa tu perfil</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Agrega información adicional a tu cuenta (puedes saltarlo por ahora)</p>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Progreso</span>
            <span className="text-xs text-gray-500">{fieldsCompleted} de 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 mb-6 text-center">{error}</p>
        )}

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Foto de perfil</label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm font-medium text-gray-700">Sube una foto</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG o GIF</p>
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Biografía</label>
              <span className="text-xs text-gray-500">{bio.length}/{BIO_MAX}</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= BIO_MAX) setBio(e.target.value)
                setError('')
              }}
              placeholder="Cuéntanos sobre ti..."
              maxLength={BIO_MAX}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24"
            />
            <p className="text-xs text-gray-400 mt-1">Máximo {BIO_MAX} caracteres</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubicación</label>
              <span className="text-xs text-gray-500">{location.length}/{LOCATION_MAX}</span>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                if (e.target.value.length <= LOCATION_MAX) setLocation(e.target.value)
                setError('')
              }}
              placeholder="Ciudad, País"
              maxLength={LOCATION_MAX}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Máximo {LOCATION_MAX} caracteres</p>
          </div>
        </form>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
          >
            {loading ? 'Guardando...' : 'Completar perfil'}
          </button>
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 rounded-lg transition-all"
          >
            Saltar por ahora
          </button>
        </div>
      </div>
    </div>
  )
}
