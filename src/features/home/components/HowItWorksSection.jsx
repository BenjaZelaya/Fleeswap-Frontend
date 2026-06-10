// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

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

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ backgroundColor: '#1b365d' }}>
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
  )
}
