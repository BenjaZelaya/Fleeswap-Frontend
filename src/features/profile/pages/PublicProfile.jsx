import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getPublicProfile } from '../services/profileService'
import useAuthStore from '../../../store/authStore'
import { getPublications } from '../../publications/services/publicationService'
import PublicationGrid from '../../../shared/components/PublicationGrid'
import ModalIntercambio from '../../solicitudes/components/ModalIntercambio'
import EstadisticasPerfil from '../components/EstadisticasPerfil'
import ReputationSection from '../components/ReputationSection'
import Seo from '../../../shared/components/Seo'
import PageSpinner from '../../../shared/components/ui/PageSpinner'
import { defaultSeo } from '../../../shared/utils/seoConfig'

// ─── Página ──────────────────────────────────────────────────────────────────
export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser, token } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('publicaciones')

  // Modales
  const [showIntercambio, setShowIntercambio] = useState(false)

  const isOwnProfile = authUser && profile && String(authUser._id || authUser.id) === String(profile._id || profile.id)

  function handleIntercambio() {
    if (!token) {
      navigate('/login', {
        state: { toast: 'Iniciá sesión para enviar una propuesta de intercambio' }
      })
      return
    }
    setShowIntercambio(true)
  }

  useEffect(() => {
    let active = true
    async function fetchProfile() {
      setLoading(true)
      setNotFound(false)
      try {
        const profileData = await getPublicProfile(id)
        if (!active) return
        setProfile(profileData)

        // Determinar si es perfil propio para traer también pausadas
        const isOwn = authUser && String(authUser._id || authUser.id) === String(profileData._id || profileData.id)
        const pubsStatus = isOwn ? 'available,unavailable' : 'available'

        const publicationsData = await getPublications({
          userId: id,
          status: pubsStatus,
          limit: 20
        })

        if (!active) return
        setPublications(
          publicationsData?.publications ||
          publicationsData?.items ||
          publicationsData?.data || []
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
  }, [id, authUser])



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

  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(' ')
  const initial = profile.nombre?.[0]?.toUpperCase() ?? '?'
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
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
              <EstadisticasPerfil profile={profile} />

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
                    onClick={handleIntercambio}
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

        {/* Tabs Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-100 px-2 mt-8 mb-6">
          <button
            onClick={() => setActiveTab('publicaciones')}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'publicaciones' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Publicaciones
            {activeTab === 'publicaciones' && (
              <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 w-full h-0.75 bg-brand rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reputacion')}
            className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'reputacion' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Reputación
            {activeTab === 'reputacion' && (
              <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 w-full h-0.75 bg-brand rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'publicaciones' ? (
            <motion.div
              key="tab-pubs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
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
                showCreateButton={isOwnProfile}
                className="xl:grid-cols-2"
              />
            </motion.div>
          ) : (
            <motion.div
              key="tab-rep"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReputationSection userId={profile._id || profile.id} isOwnProfile={isOwnProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
