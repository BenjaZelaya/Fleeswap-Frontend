import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPublicProfile } from '../services/profileService'
import useAuthStore from '../../../store/authStore'

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <svg className="animate-spin h-8 w-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )
}

export default function PublicProfile() {
  const { id } = useParams()
  const { user: authUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const isOwnProfile = authUser && profile && String(authUser.id) === String(profile._id)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await getPublicProfile(id)
        setProfile(data)
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) return <Spinner />

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Usuario no encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Este perfil no existe o fue eliminado.</p>
        </div>
        <Link to="/" className="text-sm text-brand-accent font-medium hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  if (!profile) return null

  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(' ')
  const initial = profile.nombre?.[0]?.toUpperCase() ?? '?'
  const rating = profile.averageRating ?? 0
  const totalSwaps = profile.totalSwaps ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-4"
    >
      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={fullName}
                className="w-24 h-24 rounded-2xl object-cover border border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-brand-accent flex items-center justify-center text-3xl font-bold text-white">
                {initial}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
              {profile.location && (
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {rating > 0 ? rating.toFixed(1) : '—'}
                </span>
              </div>
              <span className="text-gray-200">|</span>
              <span className="text-[11px] font-light text-slate-500">
                <span className="font-bold text-gray-700">{totalSwaps}</span> intercambios
              </span>
            </div>

            {/* Acciones */}
            <div className="pt-1">
              {isOwnProfile ? (
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-xl transition-all active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar perfil
                </Link>
              ) : (
                <button
                  disabled
                  title="Próximamente"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-100 text-gray-400 px-4 py-2 rounded-xl cursor-not-allowed"
                >
                  Iniciar intercambio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-3">Sobre mí</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Publicaciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-4">
          Publicaciones activas
        </h2>
        {profile.listings?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {profile.listings.map((listing) => (
              <div key={listing._id} className="rounded-xl border border-gray-100 overflow-hidden hover:border-brand/20 transition-colors">
                {listing.photos?.[0] && (
                  <img src={listing.photos[0]} alt={listing.title} className="w-full h-28 object-cover" />
                )}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{listing.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">Sin publicaciones activas aún.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
