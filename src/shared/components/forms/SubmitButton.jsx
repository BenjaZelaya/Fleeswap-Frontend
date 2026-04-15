import { motion } from 'framer-motion'

export default function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={!loading ? { scale: 1.015 } : {}}
      whileTap={!loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed
        text-warm-white font-semibold py-4 rounded-xl transition-colors
        flex items-center justify-center gap-2 tracking-wide"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </motion.button>
  )
}
