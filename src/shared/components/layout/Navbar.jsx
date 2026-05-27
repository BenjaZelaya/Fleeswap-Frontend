import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, User, LogIn, MessageSquare } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import { logout as logoutService } from "../../../features/auth/services/authService";
import ConfirmModal from "../ui/ConfirmModal";

function WordMark({ className = "" }) {
  return (
    <div className="flex items-center">
      <img className="w-10 h-10" src={import.meta.env.VITE_FAVICON} alt="Fleeswap" />
      <span className={`tracking-tight ${className}`}>
        <span className="font-light">Flee</span>
        <span className="font-extrabold">swap</span>
      </span>
    </div>
  );
}

function MobileTab({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
    >
      <motion.div
        animate={{ color: active ? "#2e6db4" : "#94a3b8" }}
        transition={{ duration: 0.15 }}
      >
        {icon}
      </motion.div>
      <span
        className={`text-[9px] font-light uppercase tracking-[0.18em] transition-colors ${active ? "text-brand-accent" : "text-slate-400"}`}
      >
        {label}
      </span>
    </Link>
  );
}

function Avatar({ initial, photo, alt, size = 8 }) {
  const sizeClass = `w-${size} h-${size}`;
  if (photo) {
    return (
      <img
        src={photo}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover border border-slate-200`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-brand-accent flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuthStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const isAuthenticated = !!token;
  const displayName = user?.nombre ?? user?.email?.split("@")[0] ?? "";
  const initial = displayName.charAt(0).toUpperCase();
  const isHome = location.pathname === "/";
  const isProfile = location.pathname.startsWith("/profile");

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      const insideDesktop = desktopDropdownRef.current?.contains(e.target);
      const insideMobile = mobileDropdownRef.current?.contains(e.target);
      if (!insideDesktop && !insideMobile) setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Cierra el dropdown al navegar
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutService();
    } catch {
      /* continuar */
    } finally {
      logout();
      setShowLogoutModal(false);
      navigate("/login");
    }
  }

  return (
    <>
      {/* ══ NAVBAR TOP ══════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-40 border-b border-slate-100 backdrop-blur-md"
        style={{ backgroundColor: "rgba(249,247,244,0.92)" }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/">
            <WordMark className="text-xl text-brand hover:text-brand-light transition-colors" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 hover:opacity-75 transition-opacity"
                >
                  <motion.div whileHover={{ scale: 1.06 }}>
                    <Avatar initial={initial} photo={user?.photo} alt={displayName} />
                  </motion.div>
                  <span className="text-sm font-medium text-slate-700">
                    {displayName}
                  </span>
                  <motion.svg
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{
                        duration: 0.15,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                    >
                      {/* Cabecera */}
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] font-light text-slate-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="py-1">
                        {user?.role === 'ADMIN_ROLE' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-accent font-medium hover:bg-slate-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Panel Admin
                          </Link>
                        )}
                        <Link
                          to={`/profile/${user?.id}`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Ver perfil
                        </Link>
                        <Link
                          to="/publications/create"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Crear publicación
                        </Link>
                        <Link
                          to="/my-publications"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                            />
                          </svg>
                          Mis publicaciones
                        </Link>
                        <Link
                          to="/chats"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <MessageSquare size={16} className="text-slate-400" />
                          Mensajes
                        </Link>
                        <Link
                          to="/solicitudes-recibidas"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          Recibidas
                        </Link>
                        <Link
                          to="/solicitudes-enviadas"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Enviadas
                        </Link>
                      </div>

                      {/* Separador + logout */}
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5"
                >
                  Iniciar sesión
                </Link>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="text-sm font-semibold bg-brand hover:bg-brand-light text-white px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile top — avatar abre dropdown o login */}
          <div className="lg:hidden">
            {isAuthenticated ? (
              <div className="relative" ref={mobileDropdownRef}>
                <button onClick={() => setDropdownOpen((v) => !v)}>
                  <Avatar initial={initial} photo={user?.photo} alt={displayName} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{
                        duration: 0.15,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] font-light text-slate-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        {user?.role === 'ADMIN_ROLE' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-accent font-medium hover:bg-slate-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Panel Admin
                          </Link>
                        )}
                        <Link
                          to="/publications/create"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Crear publicación
                        </Link>
                        <Link
                          to="/my-publications"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                            />
                          </svg>
                          Mis publicaciones
                        </Link>
                        <Link
                          to="/solicitudes-recibidas"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          Recibidas
                        </Link>
                        <Link
                          to="/solicitudes-enviadas"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Enviadas
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-brand-accent transition-colors flex items-center gap-1.5"
              >
                <LogIn size={16} />
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ══ BOTTOM TAB BAR — solo mobile ════════════════════════════ */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 backdrop-blur-md"
        style={{ backgroundColor: "rgba(249,247,244,0.96)" }}
      >
        <div className="relative flex h-20 items-center">
          <MobileTab
            to="/"
            icon={<Home size={20} strokeWidth={isHome ? 2.5 : 1.5} />}
            label="Inicio"
            active={isHome}
          />

          {/* Tab Publicaciones */}
          <MobileTab
            to="/explore"
            icon={<Search size={20} strokeWidth={1.5} />}
            label="Explorar"
            active={location.pathname.startsWith("/explore")}
          />

          {isAuthenticated && (
            <MobileTab
              to="/chats"
              icon={<MessageSquare size={20} strokeWidth={location.pathname.startsWith("/chats") ? 2.5 : 1.5} />}
              label="Chats"
              active={location.pathname.startsWith("/chats")}
            />
          )}

          {isAuthenticated ? (
            <MobileTab
              to={`/profile/${user?.id}`}
              icon={<User size={20} strokeWidth={isProfile ? 2.5 : 1.5} />}
              label="Perfil"
              active={isProfile}
            />
          ) : (
            <MobileTab
              to="/register"
              icon={<User size={20} strokeWidth={1.5} />}
              label="Registrarse"
              active={false}
            />
          )}
        </div>
      </div>

      {/* Modal confirmar logout */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="¿Cerrar sesión?"
        description="Vas a salir de tu cuenta en este dispositivo."
        confirmLabel="Sí, salir"
        cancelLabel="Cancelar"
        loading={loggingOut}
      />
    </>
  );
}
