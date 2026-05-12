import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { getPublications } from '../features/publications/services/publicationService'
import { PUBLICATION_TYPES, PUBLICATION_CONDITIONS, PUBLICATION_CATEGORIES } from '../utils/constants'
import SearchBar from '../shared/components/SearchBar'
import Seo from '../shared/components/Seo'
import { logError } from '../utils/logger'

const PROFILE_BANNER_KEY = 'fleeswap_profile_banner_dismissed'

function ProfileBanner({ user, onDismiss }) {
  const incomplete = !user?.photo && !user?.bio && !user?.location
  if (!incomplete) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-brand/8 border-b border-brand/10"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="flex-1 text-xs text-brand-accent leading-snug">
          <span className="font-semibold">Tu perfil está incompleto.</span>{' '}
          Añadí una foto, bio y ubicación para que otros sepan quién sos.
        </p>
        <Link
          to="/complete-profile"
          className="text-[11px] font-semibold text-brand-accent hover:text-brand transition-colors whitespace-nowrap"
        >
          Completar →
        </Link>
        <button
          onClick={onDismiss}
          aria-label="Cerrar"
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Datos hardcodeados ────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Publicá lo tuyo',
    desc: 'Subí fotos, poné el precio o marcalo solo para intercambio. En minutos está visible.',
  },
  {
    n: '02',
    title: 'Recibís solicitudes',
    desc: 'Los interesados te mandan una solicitud de compra o de intercambio. Vos elegís.',
  },
  {
    n: '03',
    title: 'Aceptás o rechazás',
    desc: 'Sin presión. Si el trato te convence, lo aceptás con un click.',
  },
  {
    n: '04',
    title: 'El chat se abre',
    desc: 'Solo cuando ambos están de acuerdo empieza la conversación para coordinar.',
  },
]

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  if (type === 'trueque')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-0.5 rounded-full">
        ⇄ Intercambio
      </span>
    )
  if (type === 'venta')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
        $ Venta
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
      ⇄ / $ Ambos
    </span>
  )
}

function getCategoryLabel(category) {
  const cat = PUBLICATION_CATEGORIES?.find((c) => c.value === category)
  return cat?.label || category
}

function PublicationCard({ pub, compact = false }) {
  const ownerInitial = pub.owner?.nombre?.[0]?.toUpperCase() ?? '?'
  const ownerName = [pub.owner?.nombre, pub.owner?.apellido].filter(Boolean).join(' ')

  return (
    <Link to={`/publications/${pub._id}`}>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full"
      >
        {/* Foto */}
        <div className="relative bg-slate-100 overflow-hidden aspect-[4/3]">
          {pub.photos?.[0] ? (
            <img
              src={pub.photos[0]}
              alt={pub.title}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Categoría */}
          <div className="absolute top-2.5 right-2.5 bg-brand/80 backdrop-blur-sm text-white text-[9px] font-light uppercase tracking-wider px-2 py-0.5 rounded-full">
            {getCategoryLabel(pub.category)}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{pub.title}</p>
            {!compact && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pub.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              {pub.owner?.photo ? (
                <img src={pub.owner.photo} alt={ownerName} className="w-5 h-5 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {ownerInitial}
                </div>
              )}
              <span className="text-[10px] font-light text-slate-400">{pub.location || pub.owner?.location || ''}</span>
            </div>
          </div>

          {/* Precio + tipo */}
          <div className="flex items-center justify-between">
            {pub.price ? (
              <span className="font-bold text-slate-900 text-base">
                ${pub.price.toLocaleString('es-AR')}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-brand-accent">Solo intercambio</span>
            )}
            <TypeBadge type={pub.type} />
          </div>

          {/* Botones de acción */}
          {!compact && (
            <div className="flex gap-2 pt-1" onClick={(e) => e.preventDefault()}>
              {(pub.type === 'trueque' || pub.type === 'ambos') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onIntercambiar?.(pub)
                  }}
                  className="flex-1 bg-brand text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-light transition-colors cursor-pointer"
                >
                  Intercambiar
                </button>
              )}
              {(pub.type === 'venta' || pub.type === 'ambos') && (
                <button type="button" className="flex-1 bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  Comprar
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(PROFILE_BANNER_KEY) === '1'
  )
  const [publications, setPublications] = useState([])
  const [loadingPubs, setLoadingPubs] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  const carouselRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateArrows = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 0)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }, [])

  const scrollPrev = useCallback(() => {
    carouselRef.current?.scrollBy({ left: -carouselRef.current.clientWidth, behavior: 'smooth' })
  }, [])

  const scrollNext = useCallback(() => {
    carouselRef.current?.scrollBy({ left: carouselRef.current.clientWidth, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    async function fetchPubs() {
      try {
        const data = await getPublications({ limit: 12 })
        setPublications(data.publications || data.items || data.data || [])
      } catch (err) {
        logError('Error cargando publicaciones:', err)
      } finally {
        setLoadingPubs(false)
      }
    }
    fetchPubs()
  }, [])

  useEffect(() => {
    if (!loadingPubs && publications.length > 0) {
      requestAnimationFrame(updateArrows)
    }
  }, [loadingPubs, publications.length, updateArrows])

  function handleDismissBanner() {
    localStorage.setItem(PROFILE_BANNER_KEY, '1')
    setBannerDismissed(true)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()

    if (searchValue.trim()) {
      params.set('search', searchValue.trim())
    }

    navigate(`/explore${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div>
      <Seo page="home" />
      {/* ── Banner perfil incompleto ─────────────────────────────────── */}
      <AnimatePresence>
        {token && user && !bannerDismissed && (
          <ProfileBanner user={user} onDismiss={handleDismissBanner} />
        )}
      </AnimatePresence>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-7">
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-[10px] font-light tracking-[0.2em] uppercase text-slate-500 border border-slate-200 px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Intercambios & Ventas de segunda mano
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight"
            >
              Tu próximo favorito{' '}
              <span className="text-brand-accent">ya vivió</span>{' '}
              una historia.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-slate-500 text-lg leading-relaxed max-w-lg"
            >
              Compralo o intercambialo directo con quien lo cuida.
              Sin comisiones. Con el objeto llega su historia.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.45 }} className="flex flex-wrap gap-3">
              {token ? (
                <Link
                  to={`/profile/${user?.id}`}
                  className="bg-brand hover:bg-brand-light text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Ver mi perfil →
                </Link>
              ) : (
                <>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/register"
                      className="inline-block bg-brand hover:bg-brand-light text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                      Empezar gratis
                    </Link>
                  </motion.div>
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-slate-900 font-semibold px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-400 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                onSubmit={handleSearchSubmit}
                placeholder="Buscar electrónica, libros, ropa y más"
                buttonLabel="Explorar"
                className="max-w-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Cards flotantes */}
          <div className="relative h-[480px] hidden lg:block">
            {publications[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute top-0 left-0 w-56 origin-bottom"
              >
                <PublicationCard pub={publications[0]} compact />
              </motion.div>
            )}
            {publications[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute top-12 right-4 w-56 origin-bottom"
              >
                <PublicationCard pub={publications[1]} compact />
              </motion.div>
            )}
            {publications[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute bottom-0 left-20 w-56 origin-top"
              >
                <PublicationCard pub={publications[2]} compact />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1b365d' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <span className="text-[10px] font-light tracking-[0.2em] uppercase text-slate-500">
              El flujo
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">
              Del objeto al acuerdo, en cuatro pasos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800 rounded-2xl overflow-hidden">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-slate-950 p-7 space-y-4"
              >
                <span className="text-[11px] font-bold text-slate-300 tracking-widest">{step.n}</span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Publicaciones reales (Carrusel) ───────────────────────────────── */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* Header con flechas de navegación */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <span className="text-[10px] font-light tracking-[0.2em] uppercase text-slate-400">
                Recomendados para vos
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                Objetos con historia, listos para vos.
              </h2>
            </div>
            {!loadingPubs && publications.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  disabled={atStart}
                  aria-label="Anterior"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollNext}
                  disabled={atEnd}
                  aria-label="Siguiente"
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>

          {loadingPubs ? (
            <div className="flex gap-5 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="shrink-0 w-full sm:w-[45%] lg:w-[31%] bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium">No hay publicaciones disponibles aún.</p>
              <p className="text-sm mt-1">Sé el primero en publicar algo.</p>
              {token && (
                <Link to="/publications/create" className="inline-block mt-4 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-light transition-colors">
                  Crear publicación
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Track del carrusel */}
              {/* px-[7.5%]: centra las cards en móvil (85% ancho → 7.5% padding c/lado) */}
              {/* sm:px-0: en tablet/desktop las cards llenan el ancho, no necesita padding */}
              <div
                ref={carouselRef}
                onScroll={updateArrows}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 px-[7.5%] sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollPaddingLeft: '7.5%', scrollPaddingRight: '7.5%' }}
              >
                {publications.map((pub) => (
                  <div
                    key={pub._id}
                    className="snap-center shrink-0 w-[85%] sm:w-[45%] lg:w-[31%]"
                  >
                    <PublicationCard pub={pub} />
                  </div>
                ))}
              </div>

              {/* Controles móvil + CTA a Explore */}
              <div className="mt-8 flex flex-col items-center gap-6">
                {/* Flechas visibles solo en móvil */}
                <div className="flex sm:hidden items-center gap-3">
                  <button
                    onClick={scrollPrev}
                    disabled={atStart}
                    aria-label="Anterior"
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={atEnd}
                    aria-label="Siguiente"
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Separador decorativo */}
                <div className="flex items-center gap-4 w-full max-w-sm">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-light tracking-[0.18em] uppercase text-slate-400 whitespace-nowrap">
                    Hay más esperándote
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Botón a Explore */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    to="/explore"
                    className="group inline-flex items-center gap-3 bg-white hover:bg-brand border border-slate-200 hover:border-brand text-slate-700 hover:text-white font-semibold px-8 py-3.5 rounded-2xl shadow-sm transition-all duration-300"
                  >
                    <span>Ver todos los objetos</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                      className="inline-block"
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10"
          >
            <div>
              <span className="text-[10px] font-light tracking-[0.2em] uppercase text-slate-400">
                Por categoría
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                Entrá por donde ya sabés qué querés mirar.
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-500">
              Cada acceso directo abre la exploración con filtros listos para compartir y retomar.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {PUBLICATION_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <Link
                  to={`/explore?category=${category.value}`}
                  className="flex min-h-28 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-brand/30 hover:bg-white hover:shadow-sm"
                >
                  <span className="text-[10px] font-light uppercase tracking-[0.18em] text-slate-400">
                    Explorar
                  </span>
                  <span className="text-base font-semibold text-slate-900 leading-snug">
                    {category.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dos modalidades ─────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="text-[10px] font-light tracking-[0.2em] uppercase text-slate-400">
              Dos formas de conseguirlo
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              Vos elegís cómo querés el trato.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Intercambiar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-brand/8 border border-brand/10 rounded-2xl p-8 space-y-5"
            >
              <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white text-xl font-bold">
                ⇄
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Intercambiar</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Ofrecé algo tuyo a cambio. Sin dinero de por medio. Si el dueño
                  acepta tu propuesta, empieza el chat para coordinar el intercambio.
                </p>
              </div>
              <ul className="space-y-2">
                {['Sin costo extra', 'Propuesta personalizada', 'Chat solo si hay acuerdo'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {!token && (
                <Link
                  to="/explore?type=trueque"
                  className="inline-block bg-brand hover:bg-brand-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Explorar trueques
                </Link>
              )}
            </motion.div>

            {/* Comprar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-amber-50 border border-amber-100 rounded-2xl p-8 space-y-5"
            >
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                $
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Comprar</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Precio fijo. Mandá una solicitud de compra directa al dueño.
                  Si la acepta, coordina el pago y la entrega vía chat.
                </p>
              </div>
              <ul className="space-y-2">
                {['Precio fijo acordado', 'Transacción directa', 'Coordinación por chat'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {!token && (
                <Link
                  to="/explore?type=venta"
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Ver objetos en venta
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      {!token && (
        <section style={{ backgroundColor: '#1b365d' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6"
          >
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Publicá lo tuyo.<br />
              <span className="text-white/70">Encontrá lo que buscabas.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Gratis, sin comisiones, directo entre personas.
            </p>
            <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
              <Link
                to="/register"
                className="inline-block bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-xl transition-colors"
              >
                Crear cuenta gratis
              </Link>
            </motion.div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
