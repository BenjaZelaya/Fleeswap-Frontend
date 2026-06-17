import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import PublicationCard from './PublicationCard'

export default function RecommendedCarouselSection({
  loadingPubs,
  publications,
  token,
  scrollPrev,
  scrollNext,
  atStart,
  atEnd,
  carouselRef,
  updateArrows,
  handleIntercambiar,
  handleComprar,
  buyingPubId
}) {
  return (
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
                <div className="aspect-4/3 bg-slate-200" />
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
            <div
              ref={carouselRef}
              onScroll={updateArrows}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {publications.map((pub) => (
                <div
                  key={pub._id}
                  className="snap-center shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
                >
                  <PublicationCard
                    pub={pub}
                    onIntercambiar={handleIntercambiar}
                    onComprar={handleComprar}
                    isBuying={buyingPubId === pub._id}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
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

              <div className="flex items-center gap-4 w-full max-w-sm">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-light tracking-[0.18em] uppercase text-slate-400 whitespace-nowrap">
                  Hay más esperándote
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

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
  )
}
