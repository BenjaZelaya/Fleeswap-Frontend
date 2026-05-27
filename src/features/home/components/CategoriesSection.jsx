import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { PUBLICATION_CATEGORIES } from '../../../utils/constants'

export default function CategoriesSection() {
  return (
    <section id="categories" className="bg-white">
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
            Cada acceso directo abre la exploración con filtros listos.
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
  )
}
