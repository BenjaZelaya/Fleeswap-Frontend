import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import SearchBar from '../../../shared/components/SearchBar'
import PublicationCard from './PublicationCard'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function HeroSection({
  token,
  user,
  searchValue,
  setSearchValue,
  handleSearchSubmit,
  publications
}) {
  return (
    <section className="bg-white" id="home">
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
        <div className="relative h-120 hidden lg:block">
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
  )
}
