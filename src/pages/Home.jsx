import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import useAuthStore from '../store/authStore'

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

const PRODUCTS = [
  {
    id: 1,
    title: 'Cámara Polaroid 600',
    desc: 'En perfecto estado. Incluye 2 paquetes de film nuevos.',
    location: 'Palermo, CABA',
    user: { name: 'Martina R.', initial: 'M' },
    price: 18000,
    type: 'both',
    match: 94,
    tag: 'Fotografía',
    photo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'Vinilo — Pink Floyd The Wall',
    desc: 'Disco doble con tapa original. Sin rayaduras visibles.',
    location: 'San Telmo, CABA',
    user: { name: 'Lucas M.', initial: 'L' },
    price: null,
    type: 'swap',
    match: 87,
    tag: 'Música',
    photo: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'Reloj Casio Vintage A158',
    desc: 'Dorado, digital, original de los 90s. Con pila nueva.',
    location: 'Belgrano, CABA',
    user: { name: 'Sofía K.', initial: 'S' },
    price: 9500,
    type: 'both',
    match: 91,
    tag: 'Accesorios',
    photo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop&auto=format',
  },
  {
    id: 4,
    title: 'Nike Air Max 90 — Talle 42',
    desc: 'Poco uso. Caja original incluida. Colorway retro.',
    location: 'Villa Crespo, CABA',
    user: { name: 'Tomás V.', initial: 'T' },
    price: 35000,
    type: 'buy',
    match: null,
    tag: 'Indumentaria',
    photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop&auto=format',
  },
  {
    id: 5,
    title: 'Colección García Márquez — 6 tomos',
    desc: 'Edición Sudamericana de los 80s. Estado coleccionable.',
    location: 'Caballito, CABA',
    user: { name: 'Paula E.', initial: 'P' },
    price: null,
    type: 'swap',
    match: 79,
    tag: 'Libros',
    photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&fit=crop&auto=format',
  },
  {
    id: 6,
    title: 'Campera de cuero marrón',
    desc: 'Talle M. Cuero genuino. Estilo vintage años 70.',
    location: 'Almagro, CABA',
    user: { name: 'Rodrigo A.', initial: 'R' },
    price: 42000,
    type: 'both',
    match: 83,
    tag: 'Indumentaria',
    photo: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&fit=crop&auto=format',
  },
]

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
  if (type === 'swap')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-0.5 rounded-full">
        ⇄ Intercambio
      </span>
    )
  if (type === 'buy')
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

function ProductCard({ product, compact = false }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col"
    >
      {/* Foto */}
      <div className={`relative bg-slate-100 overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
        <img
          src={product.photo}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Match badge */}
        {product.match && (
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-brand-accent text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            ✦ {product.match}% match
          </div>
        )}
        {/* Tag */}
        <div className="absolute top-2.5 right-2.5 bg-brand/80 backdrop-blur-sm text-white text-[9px] font-light uppercase tracking-wider px-2 py-0.5 rounded-full">
          {product.tag}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{product.title}</p>
          {!compact && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{product.desc}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {product.user.initial}
            </div>
            <span className="text-[10px] font-light text-slate-400">{product.location}</span>
          </div>
        </div>

        {/* Precio + tipo */}
        <div className="flex items-center justify-between">
          {product.price ? (
            <span className="font-bold text-slate-900 text-base">
              ${product.price.toLocaleString('es-AR')}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-brand-accent">Solo intercambio</span>
          )}
          <TypeBadge type={product.type} />
        </div>

        {/* Botones de acción */}
        {!compact && (
          <div className="flex gap-2 pt-1">
            {(product.type === 'swap' || product.type === 'both') && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => toast.info('Solicitud de intercambio enviada', {
                  description: `Le notificamos a ${product.user.name} tu propuesta.`,
                })}
                className="flex-1 bg-brand hover:bg-brand-light text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>⇄</span> Intercambiar
              </motion.button>
            )}
            {(product.type === 'buy' || product.type === 'both') && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => toast.info('Solicitud de compra enviada', {
                  description: `Le notificamos a ${product.user.name} tu intención de compra.`,
                })}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                Comprar
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const { token, user } = useAuthStore()
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(PROFILE_BANNER_KEY) === '1'
  )

  function handleDismissBanner() {
    localStorage.setItem(PROFILE_BANNER_KEY, '1')
    setBannerDismissed(true)
  }

  return (
    <div>
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
          </motion.div>

          {/* Cards flotantes */}
          <div className="relative h-[480px] hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute top-0 left-0 w-56 origin-bottom"
            >
              <ProductCard product={PRODUCTS[0]} compact />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 2 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute top-12 right-4 w-56 origin-bottom"
            >
              <ProductCard product={PRODUCTS[2]} compact />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute bottom-0 left-20 w-56 origin-top"
            >
              <ProductCard product={PRODUCTS[1]} compact />
            </motion.div>
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

      {/* ── Productos recomendados ───────────────────────────────────── */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
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
            <span className="text-[10px] font-light text-slate-400 hidden sm:block">
              {PRODUCTS.length} objetos disponibles
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <ProductCard product={product} />
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
                  to="/register"
                  className="inline-block bg-brand hover:bg-brand-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Explorar para intercambiar
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
                  to="/register"
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
