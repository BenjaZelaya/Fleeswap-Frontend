import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function CtaSection({ token }) {
  if (token) return null

  return (
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
            Crear mi cuenta gratis
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
