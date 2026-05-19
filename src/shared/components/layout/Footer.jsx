import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import {
  PlusCircle, LayoutDashboard, User, Search, Home,
  Inbox, UserPlus, LogIn, HelpCircle, Send
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'

function WordMark({ className = "" }) {
  return (
    <div className="flex items-center">
      <img className="w-8 h-8 mr-2" src={import.meta.env.VITE_FAVICON || "/favicon.ico"} alt="Fleeswap" />
      <span className={`tracking-tight ${className}`}>
        <span className="font-light text-slate-400">Flee</span>
        <span className="font-extrabold text-brand">swap</span>
      </span>
    </div>
  );
}

function FooterLink({ to, icon: Icon, children, isExternal = false, primary = false }) {
  const content = (
    <motion.div
      whileHover={{ x: 4 }}
      className={`flex items-center gap-2 text-sm transition-colors ${primary ? 'font-bold text-brand hover:text-brand-light' : 'font-medium text-slate-500 hover:text-brand'
        }`}
    >
      {Icon && <Icon size={14} className={primary ? "" : "opacity-40"} />}
      {children}
    </motion.div>
  );

  if (isExternal) {
    return (
      <li>
        <a href={to}>{content}</a>
      </li>
    );
  }

  return (
    <li>
      <Link to={to}>{content}</Link>
    </li>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { token, user } = useAuthStore();
  const isAuthenticated = !!token;

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-32 mb-16">
          {/* Columna 1: Marca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
              <WordMark className="text-3xl" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
              La red de intercambio más grande de Tucumán. <br />
              <span className="text-slate-300 font-light italic">Dale valor a lo que ya no usás.</span>
            </p>
          </motion.div>

          {/* Columna 2: Exploración */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Explorar</h4>
            <ul className="space-y-4">
              <FooterLink to="/" icon={Home}>Inicio</FooterLink>
              <FooterLink to="/explore" icon={Search}>Publicaciones</FooterLink>
              {!isAuthenticated && (
                <>
                  <FooterLink to="/register" icon={UserPlus}>Crear cuenta</FooterLink>
                  <FooterLink to="/login" icon={LogIn}>Iniciar sesión</FooterLink>
                </>
              )}
            </ul>
          </motion.div>

          {/* Columna 3: Gestión Personalizada */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">
              {isAuthenticated ? "Mi Actividad" : "Soporte"}
            </h4>
            <ul className="space-y-4">
              {isAuthenticated ? (
                <>
                  <FooterLink to="/my-publications" icon={LayoutDashboard}>Mis publicaciones</FooterLink>
                  <FooterLink to="/solicitudes-recibidas" icon={Inbox}>Solicitudes recibidas</FooterLink>
                  <FooterLink to="/solicitudes-enviadas" icon={Send}>Solicitudes enviadas</FooterLink>
                  <FooterLink to={`/profile/${user?.id}`} icon={User}>Mi perfil</FooterLink>
                  <FooterLink to="/publications/create" icon={PlusCircle} primary>Nueva publicación</FooterLink>
                </>
              ) : (
                <FooterLink to="/#how-it-works" icon={HelpCircle} isExternal>Cómo funciona</FooterLink>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Barra Inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 text-[11px] font-medium text-slate-400">
            <span>© {currentYear} Fleeswap</span>
            <span className="hidden md:inline text-slate-200">|</span>
            <span className="uppercase tracking-[0.2em] text-[9px] text-slate-300 font-bold">Tucumán, Argentina</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">Plataforma Activa</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
