import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function ModalitiesSection({ token }) {
  return (
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
  )
}
