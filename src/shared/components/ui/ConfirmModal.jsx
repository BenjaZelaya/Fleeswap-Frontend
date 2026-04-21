import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  children,
}) {
  const isDanger = variant === 'danger'

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v && !loading) onClose() }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex-col fixed items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-xl px-6 py-6 outline-none"
              >
                {isDanger && (
                  <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}

                <Dialog.Title className="text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </Dialog.Title>

                {description && (
                  <Dialog.Description className="text-sm text-slate-500 mt-1.5 mb-6 leading-relaxed">
                    {description}
                  </Dialog.Description>
                )}

                {children && <div className="mt-4">{children}</div>}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`flex-1 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm ${
                      isDanger
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-brand hover:bg-brand-light'
                    }`}
                  >
                    {loading ? 'Procesando...' : confirmLabel}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
