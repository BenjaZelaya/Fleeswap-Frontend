import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../services/profileService'
import useAuthStore from '../../../store/authStore'
import useCloudinaryWidget from '../../../shared/hooks/useCloudinaryWidget'
import { validateBio, validateLocation } from '../../../utils/validators'
import { BIO_MAX, LOCATION_MAX } from '../../../utils/constants'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const { openWidget } = useCloudinaryWidget()

  const [photo, setPhoto] = useState(null)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fieldsCompleted = (photo ? 1 : 0) + (bio.trim() ? 1 : 0) + (location.trim() ? 1 : 0)
  const progressPercentage = (fieldsCompleted / 3) * 100

  function openUploadWidget() {
    openWidget(
      (url) => { setPhoto(url); setError('') },
      () => setError('Error al subir la foto. Intentá de nuevo.')
    )
  }

  async function handleSave() {
    setError('')

    if (!photo && !bio.trim() && !location.trim()) {
      setError('Completá al menos un campo')
      return
    }

    const bioError = validateBio(bio)
    if (bioError) { setError(bioError); return }

    const locationError = validateLocation(location)
    if (locationError) { setError(locationError); return }

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
    } catch {
      setError('Error al actualizar el perfil. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ backgroundColor: '#F9F7F4' }}>
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-100 shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block text-2xl font-bold text-brand tracking-tight mb-1">
            <span className="font-light">Flee</span><span className="font-extrabold">swap</span>
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Completá tu perfil</h2>
          <p className="text-sm text-gray-400 mt-1">Podés saltarlo por ahora y hacerlo más tarde</p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-slate-400">Progreso</span>
            <span className="text-[10px] font-light text-brand-accent">{fieldsCompleted} / 3</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-brand-accent h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        <div className="space-y-6">
          {/* Foto */}
          <div>
            <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-3">
              Foto de perfil
            </label>
            {photo ? (
              <div className="relative">
                <img
                  src={photo}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-lg p-1.5 shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand/40 hover:bg-brand/5 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-brand/15 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-brand-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600 group-hover:text-brand-accent transition-colors">Subir una foto</p>
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
              onChange={(e) => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); setError('') }}
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
              onChange={(e) => { if (e.target.value.length <= LOCATION_MAX) setLocation(e.target.value); setError('') }}
              placeholder="Ciudad, País"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-brand focus:ring-0 hover:border-gray-400"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-brand hover:bg-brand-light active:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-brand/10"
          >
            {loading ? 'Guardando...' : 'Completar perfil'}
          </button>
          <button
            onClick={() => navigate('/')}
            disabled={loading}
            className="flex-1 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 font-semibold py-3 rounded-xl transition-all"
          >
            Saltar por ahora
          </button>
        </div>
      </div>
    </div>
  )
}
