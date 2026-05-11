import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getPublicProfile } from '../services/profileService'
import useAuthStore from '../../../store/authStore'
import { getPublications } from '../../publications/services/publicationService'
import PublicationGrid from '../../../shared/components/PublicationGrid'
import ModalIntercambio from '../../solicitudes/components/ModalIntercambio'
import Seo from '../../../shared/components/Seo'
import PageSpinner from '../../../shared/components/ui/PageSpinner'
import { defaultSeo } from '../../../utils/seoConfig'

// ─── Sub-componentes ────────────────────────────────────────────────────────

function StatCard({ value, label, badge }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[80px]">
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className="text-[10px] font-light text-slate-500 whitespace-nowrap">{label}</span>
      {badge && (
        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5">
          Próximamente
        </span>
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────


export default function PublicProfile() {
  const { id } = useParams()
  const { user: authUser } = useAuthStore()

  const [profile, setProfile]         = useState(null)
  const [publications, setPublications] = useState([])
  const [loading, setLoading]         = useState(true)
  const [notFound, setNotFound]       = useState(false)

  // Modales
  const [showIntercambio, setShowIntercambio] = useState(false)

  const isOwnProfile = authUser && profile && String(authUser.id) === String(profile._id)

  useEffect(() => {
    let active = true
    async function fetchProfile() {
      setLoading(true)
      setNotFound(false)
      try {
        const [profileData, publicationsData] = await Promise.all([
          getPublicProfile(id),
          getPublications({ userId: id, status: 'available', limit: 12 }),
        ])
        if (!active) return
        setProfile(profileData)
        setPublications(
          publicationsData?.publications ||
          publicationsData?.items        ||
          publicationsData?.data         || []
        )
      } catch (err) {
        if (!active) return
        if (err.response?.status === 404) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProfile()
    return () => { active = false }
  }, [id])



  if (loading) return <PageSpinner label="Cargando perfil" />

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Usuario no encontrado</p>
          <p className="mt-1 text-sm text-gray-400">Este perfil no existe o fue eliminado.</p>
        </div>
        <Link to="/" className="text-sm font-medium text-brand-accent hover:underline">Volver al inicio</Link>
      </div>
    )
  }

  if (!profile) return null

  const fullName  = [profile.nombre, profile.apellido].filter(Boolean).join(' ')
  const initial   = profile.nombre?.[0]?.toUpperCase() ?? '?'
  const rating    = profile.calificacionPromedio ?? profile.averageRating ?? 0
  const completados = profile.intercambiosCompletados ?? 0
  const canonicalUrl = `${defaultSeo.siteUrl}/profile/${profile._id}`

  return (
    <>
      <Seo
        title={`Perfil de ${fullName} - Fleeswap`}
        description={profile.bio || `${fullName} en Fleeswap.`}
        image={profile.photo || defaultSeo.image}
        url={canonicalUrl}
      />

      {/* Modales */}
      <AnimatePresence>
        {showIntercambio && (
          <ModalIntercambio
            isOpen={showIntercambio}
            onClose={() => setShowIntercambio(false)}
            publicacionesDestino={publications}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl space-y-4 px-4 py-8"
      >
        {/* ── Card principal del perfil ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.photo ? (
                <img src={profile.photo} alt={fullName} className="h-24 w-24 rounded-2xl border border-gray-100 object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-accent text-3xl font-bold text-white">
                  {initial}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{fullName}</h1>
                {profile.location && (
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-gray-400 sm:justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* Rating */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                </div>

                <StatCard value={completados} label="Intercambios" />
                <StatCard value="0" label="Compras" badge />
                <StatCard value="0" label="Ventas" badge />
              </div>

              {/* Acción */}
              <div className="pt-1">
                {isOwnProfile ? (
                  <Link
                    to="/edit-profile"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-light active:scale-[0.98]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar perfil
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowIntercambio(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-light active:scale-[0.98]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Iniciar intercambio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-[10px] font-light uppercase tracking-[0.2em] text-slate-400">Sobre mí</h2>
            <p className="text-sm leading-relaxed text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Publicaciones */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[10px] font-light uppercase tracking-[0.2em] text-slate-400">
            Publicaciones activas
          </h2>
          <PublicationGrid
            publications={publications}
            emptyTitle={isOwnProfile ? 'Aún no tenés publicaciones' : 'Sin publicaciones activas'}
            emptyDescription={
              isOwnProfile
                ? '¡Animáte a subir tu primer objeto para intercambiar o vender!'
                : 'Cuando este usuario publique artículos disponibles, van a aparecer acá.'
            }
            className="xl:grid-cols-2"
          />
          {isOwnProfile && publications.length === 0 && (
            <div className="text-center mt-4">
              <Link
                to="/publications/create"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand hover:bg-brand-light transition-colors px-5 py-2.5 rounded-xl"
              >
                + Crear publicación
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
