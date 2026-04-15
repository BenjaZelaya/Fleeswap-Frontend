import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProfile } from '../services/profileService'
import useAuthStore from '../../auth/store/authStore'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-lg font-semibold text-gray-700">Este usuario no existe</p>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    )
  }

  if (!profile) return null

  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(' ')
  const rating = profile.averageRating ?? 0
  const totalSwaps = profile.totalSwaps ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="shrink-0">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-400">
              {profile.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-800">{fullName}</h1>
          {profile.location && (
            <p className="text-sm text-gray-400 mt-0.5">{profile.location}</p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
            <span className="text-sm text-gray-600">
              ⭐ {rating > 0 ? rating.toFixed(1) : 'Sin calificaciones'}
            </span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-600">{totalSwaps} intercambios</span>
          </div>

          <div className="mt-4">
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className="inline-block text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Editar perfil
              </Link>
            ) : (
              <button
                disabled
                className="text-sm font-medium bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Iniciar intercambio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sobre mí</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Publicaciones */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Publicaciones activas
        </h2>
        {profile.listings?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {profile.listings.map((listing) => (
              <div key={listing._id} className="rounded-lg border border-gray-100 overflow-hidden">
                {listing.photos?.[0] && (
                  <img src={listing.photos[0]} alt={listing.title} className="w-full h-28 object-cover" />
                )}
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-700 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{listing.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Este usuario aún no tiene publicaciones.</p>
        )}
      </div>
    </div>
  )
}
